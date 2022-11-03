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
    align-items: center;
    pointer-events: none;
    position: fixed;
    right: 4rem;
    bottom: 0;
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

    > svg {
        padding: 0.5rem;
        width: auto;
        height: 1.5rem;
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
        toggleCacheOverlay,
        closeApp,
    } = useDebugContext();

    return (
        <div className={styles}>
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <path
                    fill="#26224C"
                    d="M132.984 37.5l-20.642 15.162v31.716l20.642 29.413M132.984 150.564L53.627 37.5l-9.193 6.773V162.5l20.642-15.162V88.79l51.619 73.71h22.58l16.291-11.936"
                />
                <path
                    fill="#00ADEE"
                    d="M65.076 88.79v58.548L44.434 162.5h22.582l20.642-15.162v-26.3M132.984 113.791V37.5h22.582v113.064h-22.582L53.627 37.5h25.809"
                />
            </svg>
            <div>{renderTime} ms render time</div>
            <button>🔦 Inspect</button>
            <button onClick={toggleQueryOverlay}>
                🗄 SQL ({sqlData.queryCount} queries, {sqlData.slowQueries.length} are slow)
            </button>
            <button onClick={toggleCacheOverlay}>
                ⚡️ Cache (hits: {cCacheHits}, misses: {cCacheMisses.length}, uncached {cCacheUncached})
            </button>
            <button onClick={closeApp}>🚫 Close</button>
        </div>
    );
};

export default StatusBar;
