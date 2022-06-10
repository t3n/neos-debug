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

use Neos\Cache\CacheAwareInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use Neos\Fusion\Core\Cache\ContentCache;
use Neos\Fusion\FusionObjects\AbstractFusionObject;
use Neos\Utility\ObjectAccess;
use t3n\Neos\Debug\Service\RenderTimer;

/**
 * @Flow\Scope("singleton")
 * @Flow\Aspect
 */
class ContentCacheSegmentAspect
{
    public const MODE_CACHED = 'cached';
    public const MODE_UNCACHED = 'uncached';
    public const MODE_DYNAMIC = 'dynamic';

    /**
     * @var mixed[]
     */
    protected $interceptedCacheEntryValues = [];

    /**
     * @var string
     */
    protected $cacheSegmentTail;

    /**
     * @var AbstractFusionObject
     */
    protected $interceptedFusionObject;

    /**
     * @Flow\Inject
     *
     * @var RenderTimer
     */
    protected $renderTimer;

    public function injectContentCache(ContentCache $contentCache): void
    {
        $randomCacheMarker = ObjectAccess::getProperty($contentCache, 'randomCacheMarker', true);
        $this->cacheSegmentTail = ContentCache::CACHE_SEGMENT_END_TOKEN . $randomCacheMarker;
    }

    /**
     * @Flow\Pointcut("setting(t3n.Neos.Debug.enabled)")
     */
    public function debuggingActive(): void
    {
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->createCacheSegment()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     */
    public function wrapCachedSegment(JoinPointInterface $joinPoint): string
    {
        $segment = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $fusionPath = $joinPoint->getMethodArgument('fusionPath');
        $renderTime = $this->renderTimer->stop($fusionPath);

        return $this->renderCacheInfoIntoSegment($segment, [
            'mode' => static::MODE_CACHED,
            'fusionPath' => $fusionPath,
            'renderMetrics' => $renderTime,
            'entryIdentifier' => $this->interceptedCacheEntryValues,
            'entryTags' => $joinPoint->getMethodArgument('tags'),
            'lifetime' => $joinPoint->getMethodArgument('lifetime')
        ]);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\RuntimeContentCache->evaluateUncached()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     *
     * @return mixed the result of uncached segments might not be of type string, so we cannot define the return type
     */
    public function wrapEvaluateUncached(JoinPointInterface $joinPoint)
    {
        $start = microtime(true);
        $segment = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $end = microtime(true);

        return $this->renderCacheInfoIntoSegment($segment, [
            'mode' => static::MODE_UNCACHED,
            'renderTime' => round(($end - $start) * 1000, 2) . ' ms',
            'fusionPath' => $joinPoint->getMethodArgument('path'),
            'contextVariables' => array_keys($joinPoint->getMethodArgument('contextArray')),
            ''
        ]);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->createUncachedSegment()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     */
    public function wrapUncachedSegment(JoinPointInterface $joinPoint): string
    {
        $segment = $joinPoint->getAdviceChain()->proceed($joinPoint);

        return $this->renderCacheInfoIntoSegment($segment, [
            'mode' => static::MODE_UNCACHED,
            'fusionPath' => $joinPoint->getMethodArgument('fusionPath'),
            'contextVariables' => array_keys($joinPoint->getMethodArgument('contextVariables')),
        ]);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->createDynamicCachedSegment()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     */
    public function wrapDynamicSegment(JoinPointInterface $joinPoint): string
    {
        $segment = $joinPoint->getAdviceChain()->proceed($joinPoint);

        return $this->renderCacheInfoIntoSegment($segment, [
            'mode' => static::MODE_DYNAMIC,
            'fusionPath' => $joinPoint->getMethodArgument('fusionPath'),
            'entryIdentifier' => $this->interceptedCacheEntryValues,
            'entryTags' => $joinPoint->getMethodArgument('tags'),
            'lifetime' => $joinPoint->getMethodArgument('lifetime'),
            'contextVariables' => array_keys($joinPoint->getMethodArgument('contextVariables')),
            'entryDiscriminator' => $joinPoint->getMethodArgument('cacheDiscriminator'),
        ]);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->renderContentCacheEntryIdentifier()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     */
    public function interceptContentCacheEntryIdentifier(JoinPointInterface $joinPoint): string
    {
        $fusionPath = $joinPoint->getMethodArgument('fusionPath');
        $cacheIdentifierValues = $joinPoint->getMethodArgument('cacheIdentifierValues');
        $this->interceptedCacheEntryValues = [];

        foreach ($cacheIdentifierValues as $key => $value) {
            if ($value instanceof CacheAwareInterface) {
                $this->interceptedCacheEntryValues[$key] = $value->getCacheEntryIdentifier();
            } elseif (is_string($value) || is_bool($value) || is_int($value)) {
                $this->interceptedCacheEntryValues[$key] = $value;
            }
        }

        $result = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $this->interceptedCacheEntryValues['[fusionPath]'] = htmlspecialchars($fusionPath);
        $this->interceptedCacheEntryValues['=> hashed identifier'] = $result;
        return $result;
    }

    /**
     * @Flow\Before("method(Neos\Fusion\Core\Cache\RuntimeContentCache->postProcess()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     */
    public function interceptFusionObject(JoinPointInterface $joinPoint): void
    {
        $this->interceptedFusionObject = $joinPoint->getMethodArgument('fusionObject');
    }

    /**
     * @param mixed $segment This is mixed as the RuntimeContentCache might also return none string values
     * @param mixed[] $info
     *
     * @return mixed the cached data might not be of type string, so we cannot define the return type
     */
    protected function renderCacheInfoIntoSegment($segment, array $info)
    {
        $injectPosition = 2;
        $info = array_slice($info, 0, $injectPosition, true)
            + ['fusionObject' => ObjectAccess::getProperty($this->interceptedFusionObject, 'fusionObjectName', true)]
            + array_slice($info, $injectPosition, count($info) - $injectPosition, true);

        // Add debug data only to html output
        $segmentFormat = $info['entryIdentifier']['format'] ?? null;

        if ($segmentFormat !== 'html') {
            return $segment;
        }

        $info['created'] = (new \DateTime())->format(DATE_W3C);

        $cCacheDebugData = '<!--__T3N_CONTENT_CACHE_DEBUG__ ' . json_encode($info) . ' -->';

        if (! is_string($segment)) {
            return $cCacheDebugData;
        }

        if ($info['mode'] === self::MODE_UNCACHED && strpos($segment, $this->cacheSegmentTail) === false) {
            // on a second page load, when outer caches are created, the uncached will be evaluated via
            // RuntimeContentCache->evaluateUncached() which won't add the cache marker. So we can just append
            // the meta data
            return $segment . $cCacheDebugData;
        }

        $segmentHead = substr($segment, 0, strlen($segment) - strlen($this->cacheSegmentTail));
        $segmentEnd = $this->cacheSegmentTail;

        // Ensure we don't place comments outside of the html tag
        $htmlEndPosition = strpos($segmentHead, '</html>');
        if ($htmlEndPosition !== false) {
            $segmentEnd = substr($segmentHead, $htmlEndPosition) . $segmentEnd;
            $segmentHead = substr($segmentHead, 0, $htmlEndPosition);
        }

        return $segmentHead . $cCacheDebugData . $segmentEnd;
    }
}
