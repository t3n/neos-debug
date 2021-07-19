import { Component, h } from 'preact';

import DebugInfos from './interfaces/DebugInfos';
import StatusBar from './features/StatusBar';
import QueryOverlay from './features/sql/QueryOverlay';
import { DebugProvider } from './context/DebugContext';
import { css, styleContainer } from './styles/css';

const CACHE_PREFIX = '__T3N_CONTENT_CACHE_DEBUG__';
const DEBUG_PREFIX = '__T3N_NEOS_DEBUG__';

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

    button {
        background: transparent;
        border: none;
        color: var(--colors-ContrastBrightest);
        cursor: pointer;

        &:hover {
            background-color: var(--colors-contrastDarker);
            color: var(--colors-PrimaryBlue);
        }
    }
`;

class NeosDebugApp extends Component {
    static tagName = 'neos-debug';
    static observedAttributes = [];
    static options = { shadow: true };

    private debugInfos: DebugInfos;
    private cCacheNodes: Node[] = [];

    loadNodes(filter: string) {
        return document.createTreeWalker(
            document.getRootNode(),
            NodeFilter.SHOW_COMMENT,
            {
                acceptNode: (node: Node) =>
                    node.nodeValue.indexOf(filter) === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
            },
            false
        );
    }

    loadCacheNodes() {
        const cacheNodes = this.loadNodes(CACHE_PREFIX);
        while (cacheNodes.nextNode()) {
            this.cCacheNodes.push(cacheNodes.currentNode);
        }
    }

    loadDebugInfos() {
        const debugNodes = this.loadNodes(DEBUG_PREFIX);
        const dataNode = debugNodes.nextNode();
        this.debugInfos = dataNode ? JSON.parse(dataNode.nodeValue.substring(DEBUG_PREFIX.length)) : null;
    }

    constructor() {
        super();
        this.loadCacheNodes();
        this.loadDebugInfos();

        console.log(this.debugInfos, 'Debug infos');
    }

    render() {
        if (!this.debugInfos) return null;

        return (
            <DebugProvider debugInfos={this.debugInfos}>
                <div dangerouslySetInnerHTML={{ __html: styleContainer.innerHTML }} />
                <div className={styles}>
                    <StatusBar />
                    <QueryOverlay />
                </div>
            </DebugProvider>
        );
    }
}

export default NeosDebugApp;
