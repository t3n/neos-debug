import { FunctionComponent } from 'preact';

import iconMagnifyingGlass from './icons/magnifying-glass-chart-solid.svg';
import iconDatabase from './icons/database-solid.svg';
import iconBoltLightning from './icons/bolt-lightning-solid.svg';
import iconXMark from './icons/circle-xmark-regular.svg';
import iconNeos from './icons/neos.svg';
import iconWarning from './icons/triangle-exclamation-solid.svg';

type ICON_SIZE = 'S' | 'M' | 'L' | 'XL';

const ICON_SIZES: Record<ICON_SIZE, string> = {
    S: '0.75rem',
    M: '1rem',
    L: '1.5rem',
    XL: '2rem',
};

const Icon: FunctionComponent<{ icon: string; size?: ICON_SIZE }> = ({ icon, size = 'M' }) => {
    return (
        <span
            dangerouslySetInnerHTML={{ __html: icon }}
            style={size != 'M' ? { height: ICON_SIZES[size] } : undefined}
        />
    );
};

export { iconMagnifyingGlass, iconDatabase, iconBoltLightning, iconXMark, iconNeos, iconWarning, Icon };
