<?php

declare(strict_types=1);

namespace t3n\Neos\Debug\Http;

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
use Neos\Flow\Http\Component\ComponentContext;
use Neos\Flow\Http\Component\ComponentInterface;
use t3n\Neos\Debug\Service\DebugService;

class MeasureServerTimingComponent implements ComponentInterface
{
    /**
     * @Flow\InjectConfiguration(path="serverTimingHeader.enabled")
     *
     * @var bool
     */
    protected $enabled;

    /**
     * @Flow\Inject
     *
     * @var DebugService
     */
    protected $debugService;

    /**
     * @inheritDoc
     */
    public function handle(ComponentContext $componentContext)
    {
        if (! $this->enabled) {
            return;
        }

        $this->debugService->startRequestTimer();
    }
}
