<?php

declare(strict_types=1);

namespace t3n\Neos\Debug\Http\Middleware;

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
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use t3n\Neos\Debug\Service\DebugService;

class MeasureServerTimingMiddleware implements MiddlewareInterface
{
    public const TIMING_ATTRIBUTE = 't3nNeosDebugTimingStart';

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

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ($this->enabled) {
            $timerStart = $this->debugService->startRequestTimer();
            $response = $handler->handle($request->withAttribute(self::TIMING_ATTRIBUTE, $timerStart));
        } else {
            $response = $handler->handle($request);
        }

        return $response;
    }
}
