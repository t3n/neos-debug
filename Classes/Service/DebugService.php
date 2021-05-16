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

use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Scope("singleton")
 */
class DebugService
{
    /**
     * @var float
     */
    protected $startRequestAt;

    /**
     * @var float
     */
    protected $stopRequestAt;

    /**
     * @var mixed[]
     */
    protected $metrics = [];

    /**
     * Starts the timer for the request process
     */
    public function startRequestTimer(): float
    {
        return $this->startRequestAt = microtime(true) * 1000;
    }

    /**
     * Sets the starttime of the request
     */
    public function setStartRequestAt(float $startRequestAt): void
    {
        $this->startRequestAt = $startRequestAt;
    }

    /**
     * Stops the timer for the request process
     */
    public function stopRequestTime(): float
    {
        return $this->stopRequestAt = microtime(true) * 1000;
    }

    /**
     * Adds a metric which will be later appended to the http header
     *
     * @param string $name the short identifier for the metric
     * @param float|null $value a numeric float value with up to 2 decimals
     * @param string|null $description the short description for the metric
     */
    public function addMetric(string $name, ?float $value = null, ?string $description = null): void
    {
        $this->metrics[$this->cleanString($name)] = [
            'value' => $value,
            'description' => $this->cleanString($description),
        ];
    }

    /**
     * Remove any special characters that might break the header
     */
    protected function cleanString(string $input): string
    {
        return preg_replace('/[^A-Za-z0-9 ]/', '', $input);
    }

    /**
     * Returns the time elapsed since `startRequestTime` and will stop the timer
     * if it has not been stopped yet.
     */
    public function getRequestTime(): float
    {
        if (! $this->stopRequestAt) {
            $this->stopRequestTime();
        }
        return round($this->stopRequestAt - $this->startRequestAt, 2);
    }

    /**
     * Returns the list of stored metrics including the request time
     *
     * @return mixed[]
     */
    public function getMetrics(): array
    {
        if (! array_key_exists('processRequest', $this->metrics)) {
            $this->addMetric('processRequest', $this->getRequestTime(), 'Process request');
        }
        return $this->metrics;
    }
}
