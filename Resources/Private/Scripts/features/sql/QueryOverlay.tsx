import { h } from 'preact';

import { useDebugContext } from '../../context/DebugContext';
import QueryTable from './QueryTable';
import Overlay from '../../presentationals/Overlay';

const QueryOverlay = () => {
    const {
        debugInfos: { sqlData },
        showQueryOverlay,
        toggleQueryOverlay,
    } = useDebugContext();

    if (!showQueryOverlay) return null;

    return (
        <Overlay toggleOverlay={toggleQueryOverlay}>
            <h1>Database query information</h1>
            <p>
                <strong>{sqlData.queryCount}</strong> queries with <strong>{sqlData.executionTime.toFixed(2)}ms</strong>{' '}
                execution time.
            </p>
            <QueryTable />
        </Overlay>
    );
};

export default QueryOverlay;
