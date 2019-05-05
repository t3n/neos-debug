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

        return $this->renderCacheInfoIntoSegment($segment, [
            'mode' => static::MODE_CACHED,
            'fusionPath' => $joinPoint->getMethodArgument('fusionPath'),
            'entryIdentifier' => $this->interceptedCacheEntryValues,
            'entryTags' => $joinPoint->getMethodArgument('tags'),
            'lifetime' => $joinPoint->getMethodArgument('lifetime')
        ]);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\RuntimeContentCache->evaluateUncached()) && t3n\Neos\Debug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     */
    public function wrapEvaluateUncached(JoinPointInterface $joinPoint): string
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
        $this->interceptedCacheEntryValues['=>'] = $result;
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
     * @param mixed[] $info
     */
    protected function renderCacheInfoIntoSegment(string $segment, array $info): string
    {
        $injectPosition = 2;
        $info = array_slice($info, 0, $injectPosition, true)
            + ['fusionObject' => ObjectAccess::getProperty($this->interceptedFusionObject, 'fusionObjectName', true)]
            + array_slice($info, $injectPosition, count($info) - $injectPosition, true);

        $info['created'] = (new \DateTime())->format('d.m.Y H:i:s');

        if ($info['mode'] === self::MODE_UNCACHED && strpos($segment, $this->cacheSegmentTail) === false) {
            // on a second page load, when outer caches are created, the uncached will be evaluated via
            // RuntimeContentCache->evaluateUncached() which won't add the cache marker. So we can just append
            // the meta data
            return $segment . '<!--__T3N_CONTENT_CACHE_DEBUG__ ' . json_encode($info) . ' -->';
        }

        $segmentHead = substr($segment, 0, strlen($segment) - strlen($this->cacheSegmentTail));
        $segmentEnd = $this->cacheSegmentTail;

        // Ensure we don't place comments outside of the html tag
        $htmlEndPosition = strpos($segmentHead, '</html>');
        if ($htmlEndPosition !== false) {
            $segmentEnd = substr($segmentHead, $htmlEndPosition) . $segmentEnd;
            $segmentHead = substr($segmentHead, 0, $htmlEndPosition);
        }

        return $segmentHead . '<!--__T3N_CONTENT_CACHE_DEBUG__ ' . json_encode($info) . ' -->' . $segmentEnd;
    }
}
