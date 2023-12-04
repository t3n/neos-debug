import { FunctionComponent, h } from 'preact';

import { useDebugContext } from '../context/DebugContext';
import iconMagnifyingGlass from '../presentationals/icons/magnifying-glass-chart-solid.svg';
import iconDatabase from '../presentationals/icons/database-solid.svg';
import iconBoltLightning from '../presentationals/icons/bolt-lightning-solid.svg';
import iconXMark from '../presentationals/icons/circle-xmark-regular.svg';
import iconNeos from '../presentationals/icons/neos.svg';
import { css } from '../styles/css';
import Icon from '../presentationals/Icon';

const styles = css`
    --button-bg: transparent;
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
    right: 0;
    bottom: 0;
    width: auto;
    z-index: 10003;

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
        debugInfos: { renderTime, sqlData, cCacheHits, cCacheMisses, cCacheUncached },
        toggleQueryOverlay,
        toggleCacheOverlay,
        toggleInspectionOverlay,
        closeApp,
    } = useDebugContext();

    return (
        <div className={styles}>
            <Icon icon={iconNeos} size="L" />
            <div>{renderTime} ms render time</div>
            <button onClick={toggleInspectionOverlay}>
                <Icon icon={iconMagnifyingGlass} /> Inspect
            </button>
            <button onClick={toggleQueryOverlay}>
                <Icon icon={iconDatabase} /> SQL ({sqlData.queryCount} queries, {sqlData.slowQueries.length} are slow)
            </button>
            <button onClick={toggleCacheOverlay}>
                <Icon icon={iconBoltLightning} /> Cache (hits: {cCacheHits}, misses: {cCacheMisses.length}, uncached{' '}
                {cCacheUncached})
            </button>
            <button onClick={closeApp}>
                <Icon icon={iconXMark} /> Close
            </button>
        </div>
    );
};

export default StatusBar;
