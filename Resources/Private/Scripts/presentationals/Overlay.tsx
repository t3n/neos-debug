import { ComponentChildren, FunctionComponent, h } from 'preact';

import { css } from '../styles/css';

const styles = css`
    align-items: flex-start;
    background-color: var(--colors-ContrastDarker);
    bottom: 5.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    color: var(--colors-ContrastBrightest);
    display: flex;
    flex-direction: column;
    font-size: 12px;
    left: 1rem;
    overflow: auto;
    padding: 2rem;
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 10002;

    h1 {
        margin: 0 0 1rem;
    }
`;

const closeButtonStyle = css`
    position: absolute;
    right: 1rem;
    top: 1rem;
`;

type OverlayProps = {
    children: ComponentChildren;
    toggleOverlay: () => void;
};

const Overlay: FunctionComponent<OverlayProps> = ({ children, toggleOverlay }) => {
    return (
        <div className={styles}>
            {children}
            <button className={closeButtonStyle} onClick={toggleOverlay}>
                ❌
            </button>
        </div>
    );
};

export default Overlay;
