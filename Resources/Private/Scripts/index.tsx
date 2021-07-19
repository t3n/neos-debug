import register from 'preact-custom-element';

import NeosDebugApp from './NeosDebugApp';

register(NeosDebugApp, 'neos-debug', [], { shadow: true });

window.addEventListener('load', () => {
    const debug = document.createElement('neos-debug');
    document.body.appendChild(debug);
});
