import { ComponentChildren, FunctionComponent, h } from 'preact';

import { css } from '../styles/css';
import { Icon, iconXMark } from './Icon';
import { useCallback, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';

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
    max-width: 1280px;
    margin: 0 auto;
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

const overlayState = signal<Overlays | null>(null);

type OverlayProps = {
    children: ComponentChildren;
    onClose?: () => void;
};

const Overlay: FunctionComponent<OverlayProps> = ({ children, onClose }) => {
    const closeOverlay = useCallback(() => {
        overlayState.value = null;
        onClose && onClose();
    }, []);

    // Close on escape
    useEffect(() => {
        const escapeEvent = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeOverlay();
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
            <button type="button" className={closeButtonStyle} onClick={closeOverlay}>
                <Icon icon={iconXMark} />
            </button>
        </div>
    );
};

export { overlayState, Overlay };
export default Overlay;
