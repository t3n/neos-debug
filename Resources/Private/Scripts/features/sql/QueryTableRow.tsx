import { FunctionComponent, h } from 'preact';

import QueryDetails from '../../interfaces/QueryDetails';
import { css } from '../../styles/css';
import { useState } from 'preact/hooks';

interface QueryTableRowProps {
    queryString: string;
    queryDetails: QueryDetails;
}

const queryTableRowStyle = css`
    ul {
        margin: 0;
    }
`;

const toggleStyle = css`
    vertical-align: top;
`;

const sqlStringStyle = css`
    display: inline-block;
    width: 500px;
    max-width: 100%;
    vertical-align: middle;
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
            <td>
                <span className={[sqlStringStyle, collapsed && collapsedStyle].join(' ')} title={queryString}>
                    {queryString}
                </span>
                <button className={toggleStyle} onClick={() => setCollapsed((prev) => !prev)}>
                    {collapsed ? '◀' : '▼'}
                </button>
            </td>
            <td>{queryDetails.executionTimeSum.toFixed(2)} ms</td>
            <td>{queryDetails.count}</td>
            <td>
                <ul>
                    {Object.keys(queryDetails.params).map((param) => (
                        <li>
                            {param}: {queryDetails.params[param]}
                        </li>
                    ))}
                </ul>
            </td>
        </tr>
    );
};

export default QueryTableRow;
