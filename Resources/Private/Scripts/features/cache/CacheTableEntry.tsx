import { FunctionComponent, h } from 'preact';

import { css } from '../../styles/css';

const ellipsisStyle = css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const rowStyle = css`
    --highlight-color: var(--colors-Warn);

    &[data-cache-hit='true'] {
        --highlight-color: var(--colors-Success);
    }
`;

const highlightStyle = css`
    background-color: var(--highlight-color);
`;

type CacheTableEntryProps = {
    cacheInfo: CacheInfo;
};

const CacheTableEntry: FunctionComponent<CacheTableEntryProps> = ({ cacheInfo }) => {
    const fusionPath = cacheInfo.fusionPath
        .replace(/\//g, '<i>/</i>')
        .replace(/<([^>/]{2,})>/g, '<span class="fusion-prototype"><span>$1</span></span>');

    return (
        <tr className={rowStyle} data-cache-hit={cacheInfo.hit}>
            <td className={highlightStyle}>{cacheInfo.mode}</td>
            <td className={highlightStyle}>{cacheInfo.hit ? 'yes' : 'no'}</td>
            <td>
                <span className={ellipsisStyle} dangerouslySetInnerHTML={{ __html: fusionPath }} />
            </td>
            <td>
                <button>Toggle prototype</button>
                <button>Details</button>
            </td>
        </tr>
    );
};

export default CacheTableEntry;
