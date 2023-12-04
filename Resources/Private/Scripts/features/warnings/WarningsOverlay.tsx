import { useComputed } from '@preact/signals';

import { useDebugContext } from '../../context/DebugContext';
import Overlay, { overlayState } from '../../presentationals/Overlay';

const WarningsOverlay = () => {
    const visible = useComputed(() => overlayState.value === 'warnings');
    const { debugInfos } = useDebugContext();

    if (!visible.value) return null;

    return (
        <Overlay>
            <h1>Warnings</h1>
            <h2>Resource stream requests ({Object.keys(debugInfos.resourceStreamRequests).length})</h2>
            <p>These requests show how many persistent resources are loaded during rendering to read their contents.</p>
            <ul>
                {Object.entries(debugInfos.resourceStreamRequests).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key}</strong>: {value}
                    </li>
                ))}
            </ul>
        </Overlay>
    );
};

export default WarningsOverlay;
