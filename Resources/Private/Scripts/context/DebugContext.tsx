import { ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';

interface ProviderProps {
    debugInfos: DebugInfos;
    cacheInfos: CacheInfo[];
    children: ComponentChildren;
    closeApp: () => void;
}

interface ProviderValues {
    debugInfos: DebugInfos;
    cacheInfos: CacheInfo[];
    closeApp: () => void;
}

const DebugContext = createContext<ProviderValues>({} as ProviderValues);
export const useDebugContext = () => useContext(DebugContext);

export const DebugProvider = ({ debugInfos, cacheInfos, closeApp, children }: ProviderProps) => {
    return (
        <DebugContext.Provider
            value={{
                debugInfos,
                cacheInfos,
                closeApp,
            }}
        >
            {children}
        </DebugContext.Provider>
    );
};
