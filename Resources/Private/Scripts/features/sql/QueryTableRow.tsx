import { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { css } from '../../styles/css';

interface QueryTableRowProps {
    queryString: string;
    queryDetails: QueryDetails;
}

const queryTableRowStyle = css`
    ul {
        margin: 0;
    }

    td {
        text-align: right;
    }
`;

const toggleStyle = css`
    vertical-align: top;
`;

const sqlStringStyle = css`
    display: inline-block;
    vertical-align: middle;
    max-width: calc(100% - 30px);
`;

const collapsedStyle = css`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const QueryTableRow: FunctionComponent<QueryTableRowProps> = ({ queryString, queryDetails }) => {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <tr className={queryTableRowStyle}>
            <td style={{ textAlign: 'left' }}>
                <span className={[sqlStringStyle, collapsed && collapsedStyle].join(' ')} title={queryString}>
                    {queryString}
                </span>
                {!collapsed && (
                    <>
                        <strong style={{ margin: '1rem 0 .5rem', display: 'block' }}>Calls by parameters:</strong>
                        <ul>
                            {Object.keys(queryDetails.params).map((param) => (
                                <li>
                                    {param}: {queryDetails.params[param]}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </td>
            <td>{queryDetails.executionTimeSum.toFixed(2)} ms</td>
            <td>{queryDetails.count}</td>
            <td>
                <button className={toggleStyle} onClick={() => setCollapsed((prev) => !prev)} title="Toggle details">
                    {collapsed ? '◀' : '▼'}
                </button>
            </td>
        </tr>
    );
};

export default QueryTableRow;
