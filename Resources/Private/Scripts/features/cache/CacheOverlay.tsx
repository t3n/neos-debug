import { h } from 'preact';

import { useDebugContext } from '../../context/DebugContext';
import { css } from '../../styles/css';
import Overlay from '../../presentationals/Overlay';
import CacheTableEntry from './CacheTableEntry';

const headerStyle = css``;

const tableStyle = css`
    border-collapse: collapse;
`;

const CacheOverlay = () => {
    const { debugInfos, cacheInfos, showCacheOverlay, toggleCacheOverlay } = useDebugContext();

    if (!showCacheOverlay) return null;

    return (
        <Overlay toggleOverlay={toggleCacheOverlay}>
            <h1>Fusion cache information</h1>
            <div className={headerStyle}>
                <div>
                    <p>Hits: ${debugInfos.cCacheHits}</p>
                </div>
                <div>
                    <p>Misses: ${debugInfos.cCacheMisses.length}</p>
                </div>
                <div>
                    <p>Uncached: ${debugInfos.cCacheUncached}</p>
                </div>
            </div>
            <table className={tableStyle}>
                <thead>
                    <th>Mode</th>
                    <th>Cache hit</th>
                    <th>Fusion path</th>
                </thead>
                <tbody>
                    {cacheInfos.map((cacheInfo) => (
                        <CacheTableEntry cacheInfo={cacheInfo} key={cacheInfo.fusionPath} />
                    ))}
                </tbody>
            </table>
        </Overlay>
    );
};

export default CacheOverlay;
