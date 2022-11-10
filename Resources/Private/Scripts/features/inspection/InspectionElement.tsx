import { FunctionComponent, h } from 'preact';
import { StateUpdater, useCallback, useEffect, useState } from 'preact/hooks';

import { css } from '../../styles/css';

type InspectionElementProps = {
    cacheInfo: CacheInfo;
    setActiveElement: StateUpdater<CacheInfo>;
};

const styles = css`
    position: absolute;
    box-shadow: 0 0 10px rgba(0, 173, 238, 0.8);
    border-radius: 0.5rem;
    padding: 1rem;
    pointer-events: none;
`;

const inspectButtonStyle = css`
    position: absolute;
    left: 0;
    top: 0;
    padding: 0.5rem;
    border-top-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    pointer-events: all;
`;

type ElementPosition = {
    top: number;
    left: number;
    width: number;
    height: number;
};

const InspectionElement: FunctionComponent<InspectionElementProps> = ({ cacheInfo, setActiveElement }) => {
    const { fusionPath, parentNode } = cacheInfo;
    const [position, setPosition] = useState<ElementPosition>(null);

    const recalculatePosition = useCallback(() => {
        console.debug('scroll', fusionPath, parentNode.getBoundingClientRect());
        const { left, top, width, height } = parentNode.getBoundingClientRect();
        const { scrollX, scrollY } = window;
        setPosition({
            left: left + scrollX,
            top: top + scrollY,
            width,
            height,
        });
    }, []);

    const toggleDetails = useCallback(() => {
        setActiveElement((prev) => (cacheInfo === prev ? null : cacheInfo));
    }, []);

    // Update position if the element is scrolled
    useEffect(() => {
        recalculatePosition();
        parentNode.addEventListener('scroll', recalculatePosition);
        return () => parentNode.removeEventListener('scroll', recalculatePosition);
    }, []);

    return position ? (
        <div
            data-fusion-path={fusionPath}
            className={styles}
            style={{
                left: `max(0px, calc(${position.left}px - 1rem))`,
                top: `max(0px, calc(${position.top}px - 1rem))`,
                height: position.height,
                width: position.width,
            }}
        >
            <button className={inspectButtonStyle} type="button" onClick={toggleDetails} title={fusionPath}>
                🔎
            </button>
        </div>
    ) : null;
};

export default InspectionElement;
