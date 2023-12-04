import { Component } from 'preact';

import StatusBar from './features/StatusBar';
import QueryOverlay from './features/sql/QueryOverlay';
import CacheOverlay from './features/cache/CacheOverlay';
import InspectionOverlay from './features/inspection/InspectionOverlay';
import { DebugProvider } from './context/DebugContext';
import { css, styleContainer } from './styles/css';
import prettyDate from './helper/prettyDate';
import WarningsOverlay from './features/warnings/WarningsOverlay';

const CACHE_PREFIX = '__NEOS_CONTENT_CACHE_DEBUG__';
const DEBUG_PREFIX = '__NEOS_DEBUG__';

const styles = css`
    --colors-PrimaryViolet: #26224c;
    --colors-PrimaryVioletHover: #342f5f;
    --colors-PrimaryBlue: #00adee;
    --colors-PrimaryBlueHover: #35c3f8;
    --colors-ContrastDarkest: #141414;
    --colors-ContrastDarker: #222;
    --colors-ContrastDark: #3f3f3f;
    --colors-ContrastNeutral: #323232;
    --colors-ContrastBright: #999;
    --colors-ContrastBrighter: #adadad;
    --colors-ContrastBrightest: #fff;
    --colors-Success: #00a338;
    --colors-SuccessHover: #0bb344;
    --colors-Warn: #ff8700;
    --colors-WarnHover: #fda23d;
    --colors-Error: #ff460d;
    --colors-ErrorHover: #ff6a3c;
    --colors-UncheckedCheckboxTick: #5b5b5b;
    --button-bg: var(--colors-ContrastNeutral);

    button {
        border: none;
        background-color: var(--button-bg);
        color: var(--colors-ContrastBrightest);
        cursor: pointer;
        white-space: break-spaces;
        padding: 0.3rem 0.5rem;

        &:hover {
            background-color: var(--colors-ContrastDark);
            color: var(--colors-PrimaryBlue);
        }
    }

    svg {
        fill: currentColor;
    }
`;

type AppProps = {
    active: boolean;
    cookiename: string;
};

type AppState = {};

class NeosDebugApp extends Component<AppProps, AppState> {
    static tagName = 'neos-debug';
    static observedAttributes = ['active', 'cookiename'];
    static options = { shadow: true };

    private debugInfos: DebugInfos;
    private cacheInfos: CacheInfo[] = [];

    writeToConsole(...params: any[]) {
        // eslint-disable-next-line no-console
        console.debug(...params);
    }

    loadNodes(filter: string): TreeWalker {
        return document.createTreeWalker(document.getRootNode(), NodeFilter.SHOW_COMMENT, {
            acceptNode: (node: Node) =>
                node.nodeValue.indexOf(filter) === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
        });
    }

    processCacheInfo(parentNode: HTMLElement, cacheInfo: CacheInfo): void {
        const { mode, created, fusionPath } = cacheInfo;
        if (mode === 'uncached') {
            this.debugInfos.cCacheUncached++;
        }

        cacheInfo.hit = mode !== 'uncached' && this.debugInfos.cCacheMisses.includes(fusionPath);
        cacheInfo.parentNode = parentNode;

        parentNode.dataset.neosDebugId = cacheInfo.fusionPath;

        // Format timestamp to a readable string
        cacheInfo.created =
            new Date(created).toLocaleString() + (mode !== 'uncached' ? ' - ' + prettyDate(created) : '');

        // TODO: Find out what we do with this
        const clone = parentNode.cloneNode() as HTMLElement;
        clone.innerHTML = '';
        cacheInfo.markup =
            clone.outerHTML.replace(/<\/.+/, '').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 150) + ' ...';
        this.cacheInfos.push(cacheInfo);
    }

    loadCacheNodes(): void {
        const cacheNodes = this.loadNodes(CACHE_PREFIX);
        while (cacheNodes.nextNode()) {
            const { currentNode } = cacheNodes;
            const parentNode = (currentNode as HTMLElement).previousElementSibling as HTMLElement;
            if (!parentNode) continue;

            const cacheInfo: CacheInfo = JSON.parse(currentNode.nodeValue.substring(CACHE_PREFIX.length));
            this.processCacheInfo(parentNode, cacheInfo);
        }
        this.writeToConsole(this.cacheInfos, 'Parsed cache nodes');
    }

    loadDebugInfos(): void {
        const debugNodes = this.loadNodes(DEBUG_PREFIX);
        const dataNode = debugNodes.nextNode();
        this.debugInfos = dataNode ? JSON.parse(dataNode.nodeValue.substring(DEBUG_PREFIX.length)) : null;
        this.writeToConsole(this.debugInfos, 'Parsed debug infos');
    }

    closeApp = () => {
        const { cookiename } = this.props;
        document.cookie = `${cookiename}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;

        // FIXME: Find a better way to set the attribute on the current element
        document.querySelector('neos-debug').setAttribute('active', 'false');

        // eslint-disable-next-line no-console
        this.writeToConsole(
            '%c Closing Neos Debug tool',
            'color: white; background: #f9423a; line-height: 20px; font-weight: bold',
        );
    };

    constructor() {
        super();
        this.loadDebugInfos();
        this.loadCacheNodes();
    }

    render({ active }) {
        if (active === 'false' || !this.debugInfos) return null;

        return (
            <DebugProvider closeApp={this.closeApp} debugInfos={this.debugInfos} cacheInfos={this.cacheInfos}>
                <div dangerouslySetInnerHTML={{ __html: styleContainer.innerHTML }} />
                <div className={styles}>
                    <StatusBar />
                    <QueryOverlay />
                    <CacheOverlay />
                    <InspectionOverlay />
                    <WarningsOverlay />
                </div>
            </DebugProvider>
        );
    }
}

export default NeosDebugApp;
