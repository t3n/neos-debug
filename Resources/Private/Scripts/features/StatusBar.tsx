import { FunctionComponent, h } from 'preact';

import { useDebugContext } from '../context/DebugContext';
import { css } from '../styles/css';

const styles = css`
    background-color: var(--colors-ContrastDarker);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    box-shadow: 0 2px 10px rgb(0 0 0 / 50%);
    display: flex;
    font-size: 18px;
    justify-content: center;
    pointer-events: none;
    position: fixed;
    right: 4rem;
    top: 0;
    width: auto;
    z-index: 10003;

    > * {
        background: transparent;
        border-left: 1px solid var(--colors-ContrastDark);
        color: var(--colors-ContrastBrightest);
        font-size: 0.75em;
        line-height: 2.5em;
        padding: 0.5rem 1.5rem;
        pointer-events: all;

        &:first-child {
            border-left: none;
            border-top-left-radius: 0.5rem;
        }
    }

    button {
        border-left: 1px solid var(--colors-ContrastDark);
        &:hover {
            color: var(--colors-PrimaryBlue);
        }
    }
`;

const StatusBar: FunctionComponent = () => {
    const {
        debugInfos: { renderTime, sqlData, cCacheHits, cCacheMisses, cCacheUncached },
        toggleQueryOverlay,
    } = useDebugContext();

    return (
        <div className={styles}>
            <div>{renderTime} ms render time</div>
            <button>🔦 Inspect</button>
            <button onClick={toggleQueryOverlay}>
                🗄 SQL ({sqlData.queryCount} queries, {sqlData.slowQueries.length} are slow)
            </button>
            <button>
                ⚡️ Cache (hits: {cCacheHits}, misses: {cCacheMisses.length}, uncached {cCacheUncached})
            </button>
            <button>🚫 Close</button>
        </div>
    );
};

export default StatusBar;
