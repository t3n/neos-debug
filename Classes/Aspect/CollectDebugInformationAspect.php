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
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use t3n\Neos\Debug\Logging\DebugStack;

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
     * @var DebugStack
     */
    protected $sqlLoggingStack;

    /**
     * @var int
     */
    protected $contentCacheHits = 0;

    /**
     * @var int
     */
    protected $contentCacheMisses = 0;

    /**
     * @Flow\Pointcut("setting(t3n.Neos.Debug.enabled)")
     */
    public function debuggingActive(): void
    {
    }

    /**
     * @Flow\Around("method(Neos\Neos\View\FusionView->render()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     *
     * @param \Neos\Flow\AOP\JoinPointInterface $joinPoint
     */
    public function addDebugValues(JoinPointInterface $joinPoint): string
    {
        $startRenderAt = microtime(true) * 1000;
        $output = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $endRenderAt = microtime(true) * 1000;

        $data = [
            'startRenderAt' => $startRenderAt,
            'endRenderAt' => $endRenderAt,
            'renderTime' => round($endRenderAt - $startRenderAt, 2),
            'sqlData' => [
                'queryCount' => $this->sqlLoggingStack->queryCount,
                'executionTime' => round($this->sqlLoggingStack->executionTime, 2),
                'tables' => $this->sqlLoggingStack->tables,
                'slowQueries' => $this->sqlLoggingStack->slowQueries,
            ],
            'cCacheHits' => $this->contentCacheHits,
            'cCacheMisses' => $this->contentCacheMisses,
        ];

        $debugOutput = '<!--__T3N_NEOS_DEBUG__ ' . json_encode($data) . '-->';
        $htmlEndPosition = strpos($output, '</html>');
        return substr($output, 0, $htmlEndPosition) . $debugOutput . substr($output, $htmlEndPosition);
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
     * @Flow\AfterReturning("method(Neos\Fusion\Core\Cache\ContentCache->getCachedSegment()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     */
    public function addCacheMiss(\Neos\Flow\AOP\JoinPointInterface $joinPoint): void
    {
        $result = $joinPoint->getResult();
        if ($result === false) {
            $this->contentCacheMisses++;
        }
    }

    /**
     * @Flow\AfterReturning("method(Neos\Fusion\Core\Cache\ContentCache->replaceCachePlaceholders()) && t3n\Neos\Debug\Aspect\CollectDebugInformationAspect->debuggingActive")
     */
    public function addCacheHit(\Neos\Flow\AOP\JoinPointInterface $joinPoint): void
    {
        $result = $joinPoint->getResult();
        $this->contentCacheHits += $result;
    }
}
