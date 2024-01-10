import { useDebugContext } from '../../context/DebugContext';
import { css } from '../../styles/css';
import Overlay, { overlayState } from '../../presentationals/Overlay';
import CacheTableEntry from './CacheTableEntry';
import { useComputed } from '@preact/signals';

const headerStyle = css`
    display: flex;
    gap: 1rem;
`;

const tableStyle = css`
    border-collapse: collapse;
    margin-top: 1rem;
    width: 100%;

    th {
        text-align: left;
        padding: 0.5rem;
        white-space: nowrap;
    }

    th,
    td {
        border: 1px solid var(--colors-ContrastDark);
        vertical-align: baseline;
    }
`;

const CacheOverlay = () => {
    const visible = useComputed(() => overlayState.value === 'cache');
    const { debugInfos, cacheInfos } = useDebugContext();

    if (!visible.value) return null;

    return (
        <Overlay>
            <h1>Fusion cache information</h1>
            <div className={headerStyle}>
                <span>
                    <strong>Hits:</strong> {debugInfos.cCacheHits}
                </span>
                <span>
                    <strong>Misses:</strong> {debugInfos.cCacheMisses.length}
                </span>
                <span>
                    <strong>Uncached:</strong> {debugInfos.cCacheUncached}
                </span>
            </div>
            <table className={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ width: 'fit-content' }}>Mode</th>
                        <th style={{ width: 'min-content' }}>Cache hit</th>
                        <th style={{ width: 'fit-content' }}>Fusion path</th>
                        <th style={{ width: 'min-content' }}>Actions</th>
                    </tr>
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
