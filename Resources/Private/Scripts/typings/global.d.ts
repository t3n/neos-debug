interface Window {
    __enable_neos_debug: (setCookie?: boolean) => void;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

type QueryDetails = {
    executionTimeSum: number;
    count: number;
    params: {
        [key: string]: any;
    };
};

type SQLQueryString = string;
type SQLTableName = string;

type CacheInfo = {
    mode: 'uncached' | 'cached' | 'dynamic';
    hit?: boolean;
    created: Date | string;
    markup?: string;
    fusionPath: string;
    fusionObject: string;
    renderMetrics: {
        renderTime: string;
        sqlQueryCount: number;
    };
    entryIdentifier: Record<string, any>;
    entryTags: string[];
    lifetime: null | number;
    parentNode: HTMLElement;
};

type DebugInfos = {
    renderTime: number;
    startRenderAt: number;
    endRenderAt: number;
    sqlData: {
        queryCount: number;
        executionTime: number;
        slowQueries: SQLQueryString[];
        tables: {
            [key: SQLTableName]: {
                queryCount: number;
                executionTime: number;
            };
        };
        groupedQueries: {
            [key: SQLTableName]: {
                [key: SQLQueryString]: QueryDetails;
            };
        };
    };
    cCacheHits: number;
    // TODO: Create type for cache misses
    cCacheMisses: string[];
    cCacheUncached: number;
};
