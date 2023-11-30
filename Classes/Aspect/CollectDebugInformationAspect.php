<?php

declare(strict_types=1);

namespace t3n\Neos\Debug\Aspect;

/**
 * This file is part of the t3n.Neos.Debugger package.
 *
 * (c) 2019 yeebase media GmbH
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\Utils;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use t3n\Neos\Debug\Logging\DebugStack;
use t3n\Neos\Debug\Service\DebugService;

/**
 * @Flow\Scope("singleton")
 * @Flow\Aspect
 */
class CollectDebugInformationAspect
{
    /**
     * @Flow\Inject()
     *
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @Flow\Inject
     *
     * @var DebugService
     */
    protected $debugService;

    /**
     * @var DebugStack
     */
    protected $sqlLoggingStack;

    /**
     * @var int
     */
    protected $contentCacheHits = 0;

    /**
     * @var string[]
     */
    protected $contentCacheMisses = [];

    /**
     * @Flow\InjectConfiguration(package="t3n.Neos.Debug", path="serverTimingHeader.enabled")
     *
     * @var bool
     */
    protected $serverTimingHeaderEnabled;

    /**
     * @Flow\InjectConfiguration(package="t3n.Neos.Debug", path="htmlOutput.enabled")
     *
     * @var bool
     */
    protected $htmlOutputEnabled;

    /**
     * @Flow\Pointcut("setting(t3n.Neos.Debug.enabled)")
     */
    public function debuggingActive(): void
    {
    }

    /**
     * @Flow\Around("method(Neos\Neos\View\FusionView->render()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     * @Flow\Around("method(Neos\Fusion\View\FusionView->render()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     *
     * @param \Neos\Flow\AOP\JoinPointInterface $joinPoint
     *
     * @return string|Response
     */
    public function addDebugValues(JoinPointInterface $joinPoint)
    {
        $startRenderAt = microtime(true) * 1000;
        $response = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $endRenderAt = microtime(true) * 1000;

        $renderTime = round($endRenderAt - $startRenderAt, 2);
        $sqlExecutionTime = round($this->sqlLoggingStack->executionTime, 2);

        if ($this->serverTimingHeaderEnabled) {
            $this->debugService->addMetric('fusionRenderTime', $renderTime, 'Fusion rendering');
            $this->debugService->addMetric('sqlExecutionTime', $sqlExecutionTime, 'Combined SQL execution');
            if ($this->contentCacheMisses === 0) {
                $this->debugService->addMetric('contentCacheHit', null, 'Content cache hit');
            } else {
                $this->debugService->addMetric('contentCacheMiss', null, 'Content cache miss');
            }
        }

        if (! $this->htmlOutputEnabled) {
            return $response;
        }

        if ($response instanceof Response) {
            $output = $response->getBody()->getContents();
            $response->getBody()->rewind();

            if ($response->getHeader('Content-Type') !== 'text/html'
                && strpos($output, '<!DOCTYPE html>') === false) {
                return $response;
            }
        } else {
            $output = $response;
        }

        $groupedQueries = $this->groupQueries($this->sqlLoggingStack->queries);

        $data = [
            'startRenderAt' => $startRenderAt,
            'endRenderAt' => $endRenderAt,
            'renderTime' => $renderTime,
            'sqlData' => [
                'queryCount' => $this->sqlLoggingStack->queryCount,
                'executionTime' => $sqlExecutionTime,
                'tables' => $this->sqlLoggingStack->tables,
                'slowQueries' => $this->sqlLoggingStack->slowQueries,
                'groupedQueries' => $groupedQueries,
            ],
            'cCacheHits' => $this->contentCacheHits,
            'cCacheMisses' => $this->contentCacheMisses,
            'cCacheUncached' => 0, // Init as 0 as the actual number has to be resolved from the individual cache entries
        ];

        $debugOutput = '<!--__NEOS_DEBUG__ ' . json_encode($data) . '-->';
        $htmlEndPosition = strpos($output, '</html>');

        if ($htmlEndPosition === false) {
            $output .= $debugOutput;
        } else {
            $output = substr($output, 0, $htmlEndPosition) . $debugOutput . substr($output, $htmlEndPosition);
        }

        if ($response instanceof Response) {
            return $response->withBody(Utils::streamFor($output));
        }
        return $output;
    }

    /**
     * @Flow\Before("method(Neos\Flow\Mvc\Routing\Router->route()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     */
    public function startSqlLogging(\Neos\Flow\AOP\JoinPointInterface $joinPoint): void
    {
        $this->sqlLoggingStack = new DebugStack();
        $this->entityManager->getConfiguration()->setSQLLogger($this->sqlLoggingStack);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->getCachedSegment()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     *
     * @phpcsSuppress SlevomatCodingStandard.TypeHints.ReturnTypeHint.MissingAnyTypeHint
     */
    public function addCacheMiss(\Neos\Flow\AOP\JoinPointInterface $joinPoint)
    {
        $fusionPath = $joinPoint->getMethodArgument('fusionPath');

        $result = $joinPoint->getAdviceChain()->proceed($joinPoint);
        if ($result === false) {
            $this->contentCacheMisses[]= $fusionPath;
        }
        return $result;
    }

    /**
     * @Flow\AfterReturning("method(Neos\Fusion\Core\Cache\ContentCache->replaceCachePlaceholders()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     */
    public function addCacheHit(\Neos\Flow\AOP\JoinPointInterface $joinPoint): void
    {
        $result = $joinPoint->getResult();
        $this->contentCacheHits += $result;
    }

    /**
     * Queries look like ['sql' => $sql, 'table' => $tableName, 'params' => $params, 'types' => $types, 'executionMS' => 0]
     */
    protected function groupQueries(array $queries): array
    {
        return array_reduce($queries, static function ($carry, $queryData) {
            ['sql' => $sql, 'table' => $table, 'params' => $params, 'executionMS' => $executionMS] = $queryData;
            $paramString = json_encode($params);

            if (!array_key_exists($table, $carry)) {
                $carry[$table] = [];
            }

            if (!array_key_exists($sql, $carry[$table])) {
                $carry[$table][$sql] = [
                    'executionTimeSum' => 0,
                    'count' => 0,
                    'params' => [],
                ];
            }

            $carry[$table][$sql]['executionTimeSum'] += $executionMS;
            $carry[$table][$sql]['count']++;

            if (!array_key_exists($paramString, $carry[$table][$sql]['params'])) {
                $carry[$table][$sql]['params'][$paramString] = 1;
            } else {
                $carry[$table][$sql]['params'][$paramString]++;
            }

            return $carry;
        }, []);
    }
}
