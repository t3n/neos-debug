import register from 'preact-custom-element';

import NeosDebugApp from './NeosDebugApp';

(() => {
    const COOKIE_NAME = '__neos_debug__';
    let component = null;
    let registered = false;

    window.__enable_neos_debug = (setCookie = false) => {
        // eslint-disable-next-line no-console
        console.debug(
            '%c Starting Neos Debug Tool ... ',
            'color: white; background: #f9423a; line-height: 20px; font-weight: bold',
        );

        if (setCookie) {
            document.cookie = `${COOKIE_NAME}=true;path=/;SameSite=Strict`;
        } else {
            // eslint-disable-next-line no-console
            console.debug(
                'Start the Debug tool with "__enable_neos_debug__(true)" to start up the Debug tool on every page load',
            );
        }

        if (!registered) {
            // Register & add the debug web component, tagName and attributes are automatically read from the component
            register(NeosDebugApp, null, null, NeosDebugApp.options);
            registered = true;
            component = document.createElement(NeosDebugApp.tagName);
            component.setAttribute('cookiename', COOKIE_NAME);
            document.body.appendChild(component);
        }
        component.setAttribute('active', 'true');
    };

    const debugCookie = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));

    if (debugCookie && debugCookie[1] === 'true') {
        // Add a single debug web component instance to the document
        window.addEventListener('load', () => window.__enable_neos_debug());
    }
})();
