import { FunctionComponent } from 'preact';

import { useDebugContext } from '../context/DebugContext';
import { css } from '../styles/css';
import {
    Icon,
    iconXMark,
    iconNeos,
    iconWarning,
    iconMagnifyingGlass,
    iconDatabase,
    iconBoltLightning,
} from '../presentationals/Icon';
import { overlayState } from '../presentationals/Overlay';
import { useCallback } from 'preact/hooks';

const styles = css`
    --button-bg: transparent;
    background-color: var(--colors-ContrastDarker);
    border-top-left-radius: 0.5rem;
    box-shadow: 0 2px 10px rgb(0 0 0 / 50%);
    display: flex;
    font-size: 18px;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    position: fixed;
    right: 0;
    bottom: 0;
    width: auto;
    z-index: 10003;
    padding: 0 0.5rem 0 0;

    > * {
        background: transparent;
        border-left: 1px solid var(--colors-ContrastDark);
        color: var(--colors-ContrastBrightest);
        font-size: 0.75em;
        line-height: 1.6em;
        padding: 0.5rem;
        pointer-events: all;

        &:first-child {
            border-left: none;
            border-top-left-radius: 0.5rem;
        }
    }

    svg {
        height: inherit;
        width: auto;
        vertical-align: text-bottom;
        fill: currentColor;
    }

    button {
        border-left: 1px solid var(--colors-ContrastDark);
        display: flex;
        gap: 0.3rem;
        user-select: none;
        transition:
            color 0.1s ease-in-out,
            background-color 0.1s ease-in-out;

        &:hover {
            color: var(--colors-PrimaryBlue);
        }
    }
`;

const StatusBar: FunctionComponent = () => {
    const {
        debugInfos: { renderTime, sqlData, cCacheHits, cCacheMisses, cCacheUncached, resourceStreamRequests },
        closeApp,
    } = useDebugContext();

    const toggleOverlay = useCallback((overlay: Overlays) => {
        overlayState.value = overlayState.value === overlay ? null : overlay;
    }, []);

    return (
        <div className={styles}>
            <Icon icon={iconNeos} size="L" />
            <div>{renderTime} ms render time</div>
            <button onClick={() => toggleOverlay('inspection')}>
                <Icon icon={iconMagnifyingGlass} /> Inspect
            </button>
            <button onClick={() => toggleOverlay('query')}>
                <Icon icon={iconDatabase} /> SQL ({sqlData.queryCount} queries, {sqlData.slowQueries.length} are slow)
            </button>
            <button onClick={() => toggleOverlay('cache')}>
                <Icon icon={iconBoltLightning} /> Cache (hits: {cCacheHits}, misses: {cCacheMisses.length}, uncached{' '}
                {cCacheUncached})
            </button>
            <button onClick={() => toggleOverlay('warnings')}>
                <Icon icon={iconWarning} /> Warnings ({Object.keys(resourceStreamRequests).length})
            </button>
            <button onClick={closeApp}>
                <Icon icon={iconXMark} />
            </button>
        </div>
    );
};

export default StatusBar;
