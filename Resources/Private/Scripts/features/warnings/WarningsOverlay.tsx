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
            <table>
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>SHA1</th>
                        <th>Collection</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(debugInfos.resourceStreamRequests).map((resource, index) => (
                        <tr key={index}>
                            <td>{resource.filename}</td>
                            <td>{resource.sha1}</td>
                            <td>{resource.collectionName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Overlay>
    );
};

export default WarningsOverlay;
