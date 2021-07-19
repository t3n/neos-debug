import { h } from 'preact';

import { useDebugContext } from '../../context/DebugContext';
import QueryTable from './QueryTable';
import { css } from '../../styles/css';

const styles = css`
    align-items: flex-start;
    background-color: var(--colors-ContrastDarker);
    bottom: 5.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    color: var(--colors-ContrastBrightest);
    display: flex;
    flex-direction: column;
    font-size: 12px;
    left: 1rem;
    overflow: auto;
    padding: 2rem;
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 10002;

    h1 {
        margin: 0 0 1rem;
    }
`;

const closeButtonStyle = css`
    position: absolute;
    right: 1rem;
    top: 1rem;
`;

const QueryOverlay = () => {
    const {
        debugInfos: { sqlData },
        showQueryOverlay,
        toggleQueryOverlay,
    } = useDebugContext();

    if (!showQueryOverlay) return null;

    return (
        <div className={styles}>
            <h1>Database query information</h1>
            <p>
                <strong>{sqlData.queryCount}</strong> queries with <strong>{sqlData.executionTime.toFixed(2)}ms</strong>{' '}
                execution time.
            </p>
            <QueryTable />
            <button className={closeButtonStyle} onClick={toggleQueryOverlay}>
                ❌
            </button>
        </div>
    );
};

export default QueryOverlay;
