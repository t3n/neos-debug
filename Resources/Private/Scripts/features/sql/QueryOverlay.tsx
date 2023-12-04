import { useComputed } from '@preact/signals';

import { useDebugContext } from '../../context/DebugContext';
import QueryTable from './QueryTable';
import Overlay, { overlayState } from '../../presentationals/Overlay';

const QueryOverlay = () => {
    const visible = useComputed(() => overlayState.value === 'query');
    const {
        debugInfos: { sqlData },
    } = useDebugContext();

    if (!visible.value) return null;

    return (
        <Overlay>
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
