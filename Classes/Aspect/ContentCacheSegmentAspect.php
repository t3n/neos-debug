<?php
namespace Yeebase\Fusion\ContentCacheDebug\Aspect;

/**
 * This file is part of the Yeebase.Fusion.ContentCacheDebug package.
 *
 * (c) 2018 yeebase media GmbH
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
    const MODE_CACHED = 'cached';
    const MODE_UNCACHED = 'uncached';
    const MODE_DYNAMIC = 'dynamic';

    /**
     * @var array
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
     * @param ContentCache $contentCache
     */
    public function injectContentCache(ContentCache $contentCache)
    {
        $randomCacheMarker = ObjectAccess::getProperty($contentCache, 'randomCacheMarker', true);
        $this->cacheSegmentTail = ContentCache::CACHE_SEGMENT_END_TOKEN . $randomCacheMarker;
    }

    /**
     * @Flow\Pointcut("setting(Yeebase.Fusion.ContentCacheDebug.enabled) && evaluate(current.securityContext.initialized == true, current.securityContext.roles contains 'Yeebase.Fusion.ContentCacheDebug:Debugger')")
     */
    public function debuggingActive()
    {
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->createCacheSegment()) && Yeebase\Fusion\ContentCacheDebug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     * @param JoinPointInterface $joinPoint
     * @return string
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
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->createUncachedSegment()) && Yeebase\Fusion\ContentCacheDebug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     * @param JoinPointInterface $joinPoint
     * @return string
     */
    public function wrapUncachedSegment(JoinPointInterface $joinPoint): string
    {
        $segment = $joinPoint->getAdviceChain()->proceed($joinPoint);

        return $this->renderCacheInfoIntoSegment($segment, [
            'mode' => static::MODE_UNCACHED,
            'fusionPath' => $joinPoint->getMethodArgument('fusionPath'),
            'contextVariables' => array_keys($joinPoint->getMethodArgument('contextVariables'))
        ]);
    }


    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->createDynamicCachedSegment()) && Yeebase\Fusion\ContentCacheDebug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     * @param JoinPointInterface $joinPoint
     * @return string
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
            'entryDiscriminator' => $joinPoint->getMethodArgument('cacheDiscriminator')
        ]);
    }

    /**
     * @Flow\Around("method(Neos\Fusion\Core\Cache\ContentCache->renderContentCacheEntryIdentifier()) && Yeebase\Fusion\ContentCacheDebug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     * @param JoinPointInterface $joinPoint
     * @return string
     */
    public function interceptContentCacheEntryIdentifier(JoinPointInterface $joinPoint): string
    {

        $cacheIdentifierValues = $joinPoint->getMethodArgument('cacheIdentifierValues');
        $this->interceptedCacheEntryValues = [];

        foreach ($cacheIdentifierValues as $key => $value) {
            if ($value instanceof CacheAwareInterface) {
                $this->interceptedCacheEntryValues[$key] = $value->getCacheEntryIdentifier();
            } else if (is_string($value) || is_bool($value) || is_integer($value)) {
                $this->interceptedCacheEntryValues[$key] = $value;
            }
        }

        $result = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $this->interceptedCacheEntryValues['=>'] = $result;
        return $result;
    }

    /**
     * @Flow\Before("method(Neos\Fusion\Core\Cache\RuntimeContentCache->postProcess()) && Yeebase\Fusion\ContentCacheDebug\Aspect\ContentCacheSegmentAspect->debuggingActive")
     * @param JoinPointInterface $joinPoint
     */
    public function interceptFusionObject(JoinPointInterface $joinPoint)
    {
        $this->interceptedFusionObject = $joinPoint->getMethodArgument('fusionObject');
    }

    /**
     * @param string $segment
     * @param array $info
     * @return string
     */
    protected function renderCacheInfoIntoSegment(string $segment, array $info): string
    {
        $injectPosition = 2;
        $info = array_slice($info, 0, $injectPosition, true)
            + ['fusionObject' => ObjectAccess::getProperty($this->interceptedFusionObject, 'fusionObjectName', true)]
            + array_slice($info, $injectPosition, count($info) - $injectPosition, true);

        $info['created'] = (new \DateTime())->format('d.m.Y H:i:s');

        $segmentHead = substr($segment, 0, strlen($segment) - strlen($this->cacheSegmentTail));
        $segmentEnd = $this->cacheSegmentTail;

        // Ensure we don't place comments outside of the html tag
        $htmlEndPosition = strpos($segmentHead, '</html>');
        if ($htmlEndPosition !== false) {
            $segmentEnd = substr($segmentHead, $htmlEndPosition) . $segmentEnd;
            $segmentHead = substr($segmentHead, 0, $htmlEndPosition);
        }

        return $segmentHead . '<!--__CONTENT_CACHE_DEBUG__ ' . json_encode($info) . ' -->' . $segmentEnd;
    }
}
