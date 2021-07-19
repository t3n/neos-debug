import { h, ComponentChildren, createContext } from 'preact';
import { useCallback, useContext, useState } from 'preact/hooks';

import DebugInfos from '../interfaces/DebugInfos';

interface ProviderProps {
    debugInfos: DebugInfos;
    children: ComponentChildren;
}

interface ProviderValues {
    debugInfos: DebugInfos;
    showQueryOverlay: boolean;
    toggleQueryOverlay: () => void;
}

const DebugContext = createContext<ProviderValues>({} as ProviderValues);
export const useDebugContext = () => useContext(DebugContext);

export const DebugProvider = ({ debugInfos, children }: ProviderProps) => {
    const [showQueryOverlay, setShowQueryOverlay] = useState(false);

    const toggleQueryOverlay = useCallback(() => {
        setShowQueryOverlay((prev) => !prev);
    }, []);

    return (
        <DebugContext.Provider value={{ debugInfos, showQueryOverlay, toggleQueryOverlay }}>
            {children}
        </DebugContext.Provider>
    );
};
