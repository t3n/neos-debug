import { h, ComponentChildren, createContext } from 'preact';
import { useCallback, useContext, useState } from 'preact/hooks';

interface ProviderProps {
    debugInfos: DebugInfos;
    cacheInfos: CacheInfo[];
    children: ComponentChildren;
    closeApp: () => void;
}

interface ProviderValues {
    debugInfos: DebugInfos;
    cacheInfos: CacheInfo[];
    showQueryOverlay: boolean;
    toggleQueryOverlay: () => void;
    showCacheOverlay: boolean;
    toggleCacheOverlay: () => void;
    closeApp: () => void;
}

const DebugContext = createContext<ProviderValues>({} as ProviderValues);
export const useDebugContext = () => useContext(DebugContext);

export const DebugProvider = ({ debugInfos, cacheInfos, closeApp, children }: ProviderProps) => {
    const [showQueryOverlay, setShowQueryOverlay] = useState(false);
    const [showCacheOverlay, setShowCacheOverlay] = useState(false);

    const toggleQueryOverlay = useCallback(() => {
        setShowQueryOverlay((prev) => !prev);
    }, []);

    const toggleCacheOverlay = useCallback(() => {
        setShowCacheOverlay((prev) => !prev);
    }, []);

    return (
        <DebugContext.Provider
            value={{
                debugInfos,
                cacheInfos,
                showQueryOverlay,
                toggleQueryOverlay,
                showCacheOverlay,
                toggleCacheOverlay,
                closeApp,
            }}
        >
            {children}
        </DebugContext.Provider>
    );
};
