import { FunctionComponent, h } from 'preact';

import { css } from '../../styles/css';
import { useState } from 'preact/hooks';

const rowStyle = css`
    --color-positive: var(--colors-Success);
    --color-negative: var(--colors-Warn);
    --color-neutral: var(--colors-ContrastBright);

    td {
        padding: 0.5rem;
    }
`;

const highlightPositive = css`
    background-color: var(--color-positive);
`;

const highlightNeutral = css`
    background-color: var(--color-neutral);
`;

const highlightNegative = css`
    background-color: var(--color-negative);
`;

const fusionPathStyle = css`
    word-break: break-word;
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.3em;
    line-height: 1.4;

    i {
        color: var(--colors-ContrastBright);
    }

    .fragment {
        color: var(--colors-ContrastBrighter);
    }

    .prototype {
        display: none;
        font-weight: bold;
        color: var(--colors-PrimaryBlue);
    }

    &[data-show-prototypes='true'] .prototype {
        display: inline-block;
    }
`;

const actionsStyle = css`
    display: flex;
    gap: 0.5rem;
`;

type CacheTableEntryProps = {
    cacheInfo: CacheInfo;
};

const IGNORED_DETAIL_KEYS = ['mode', 'hit', 'fusionPath'];

function ucFirst(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDetailValue(value: any): string {
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return value;
}

const CacheTableEntry: FunctionComponent<CacheTableEntryProps> = ({ cacheInfo }) => {
    const [showPrototypes, setShowPrototypes] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const regex = /([^<>/]+)<([^<>:/]+:[^<>:/]+)(?::(.*?))?>(?:\/|$)/g;

    const formattedString = cacheInfo.fusionPath.replace(
        regex,
        '<span class="fragment">$1</span><span class="prototype">&lt;$2$3&gt;</span><i>/</i>',
    );

    const modeStyle =
        cacheInfo.mode == 'cached'
            ? highlightPositive
            : cacheInfo.mode == 'dynamic'
              ? highlightNeutral
              : highlightNegative;

    const cacheHitStyle = cacheInfo.hit ? highlightPositive : highlightNegative;

    return (
        <>
            <tr className={rowStyle} data-cache-hit={cacheInfo.hit}>
                <td className={modeStyle}>{ucFirst(cacheInfo.mode)}</td>
                <td className={cacheHitStyle}>{cacheInfo.hit ? 'Yes' : 'No'}</td>
                <td>
                    <div
                        className={fusionPathStyle}
                        data-show-prototypes={showPrototypes}
                        dangerouslySetInnerHTML={{ __html: formattedString }}
                    />
                </td>
                <td>
                    <div className={actionsStyle}>
                        <button onClick={() => setShowPrototypes((prev) => !prev)}>Toggle prototype</button>
                        <button onClick={() => setShowDetails((prev) => !prev)}>Details</button>
                    </div>
                </td>
            </tr>
            {showDetails &&
                Object.keys(cacheInfo)
                    .filter((key) => !IGNORED_DETAIL_KEYS.includes(key))
                    .map((key) => (
                        <tr key={key}>
                            <td>{ucFirst(key)}</td>
                            <td colSpan={3}>{formatDetailValue(cacheInfo[key])}</td>
                        </tr>
                    ))}
        </>
    );
};

export default CacheTableEntry;
