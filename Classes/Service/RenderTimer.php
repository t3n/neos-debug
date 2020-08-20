<?php

declare(strict_types=1);

namespace t3n\Neos\Debug\Service;

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
use t3n\Neos\Debug\Logging\DebugStack;

/**
 * @Flow\Scope("singleton")
 */
class RenderTimer
{
    /**
     * @Flow\Inject()
     *
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @var mixed[]
     */
    protected $renderMetrics = [];

    /**
     * Starts a render timer for a certain fusion path
     */
    public function start(string $fusionPath): void
    {
        $sqlLoggingStack = $this->entityManager->getConfiguration()->getSQLLogger();
        $queryCount = $sqlLoggingStack instanceof DebugStack ? $sqlLoggingStack->queryCount : 0;

        $this->renderMetrics[$fusionPath] = [
            'startRenderAt' => $this->ts(),
            'sqlQueryCount' => $queryCount,
        ];
    }

    /**
     * Return current microtime in ms
     */
    private function ts(): float
    {
        return microtime(true) * 1000;
    }

    /**
     * Stops the timer and returns the computed values
     *
     * @return mixed[]|null
     */
    public function stop(string $fusionPath): ?array
    {
        if (! array_key_exists($fusionPath, $this->renderMetrics)) {
            return null;
        }

        $metrics = $this->renderMetrics[$fusionPath];
        $sqlLoggingStack = $this->entityManager->getConfiguration()->getSQLLogger();
        $queryCount = $sqlLoggingStack instanceof DebugStack ? $sqlLoggingStack->queryCount : 0;

        return [
            'renderTime' => round($this->ts() - $metrics['startRenderAt'], 2) . ' ms',
            'sqlQueryCount' => $queryCount - $metrics['sqlQueryCount'],
        ];
    }
}
