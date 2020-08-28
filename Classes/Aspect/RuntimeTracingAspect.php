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

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use t3n\Neos\Debug\Service\RenderTimer;

/**
 * @Flow\Aspect
 * @Flow\Scope("singleton")
 */
class RuntimeTracingAspect
{
    /**
     * @Flow\Inject
     *
     * @var RenderTimer
     */
    protected $renderTimer;

    /**
     * @Flow\Pointcut("setting(t3n.Neos.Debug.enabled)")
     */
    public function debuggingActive(): void
    {
    }

    /**
     * @Flow\Before("method(Neos\Fusion\Core\Cache\RuntimeContentCache->enter()) && t3n\Neos\Debug\Aspect\RuntimeTracingAspect->debuggingActive")
     */
    public function onEnter(JoinPointInterface $joinPoint): void
    {
        $configuration = $joinPoint->getMethodArgument('configuration');
        $fusionPath = $joinPoint->getMethodArgument('fusionPath');

        $cacheMode = $configuration['mode'] ?? null;

        if (! $cacheMode) {
            return;
        }

        $this->renderTimer->start($fusionPath);
    }
}
