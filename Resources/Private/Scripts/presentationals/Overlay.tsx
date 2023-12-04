import { ComponentChildren, FunctionComponent, h } from 'preact';

import { css } from '../styles/css';
import Icon from './Icon';
import iconXMark from './icons/circle-xmark-regular.svg';
import { useEffect } from 'preact/hooks';

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
    padding: 1rem;
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
    right: 0;
    top: 0;
    padding: 1rem;
    color: white;
`;

type OverlayProps = {
    children: ComponentChildren;
    toggleOverlay: () => void;
};

const Overlay: FunctionComponent<OverlayProps> = ({ children, toggleOverlay }) => {
    // Close on escape
    useEffect(() => {
        const escapeEvent = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                toggleOverlay();
            }
        };

        window.addEventListener('keydown', escapeEvent);

        return () => {
            window.removeEventListener('keydown', escapeEvent);
        };
    });

    return (
        <div className={styles}>
            {children}
            <button type="button" className={closeButtonStyle} onClick={toggleOverlay}>
                <Icon icon={iconXMark} />
            </button>
        </div>
    );
};

export default Overlay;
