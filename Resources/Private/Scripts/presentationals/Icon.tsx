import { FunctionComponent } from 'preact';

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

export default Icon;
