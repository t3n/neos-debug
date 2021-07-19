import QueryDetails from './QueryDetails';

export default interface DebugInfos {
    renderTime: number;
    startRenderAt: number;
    endRenderAt: number;
    sqlData: {
        queryCount: number;
        executionTime: number;
        slowQueries: string[];
        tables: {
            [key: string]: {
                queryCount: number;
                executionTime: number;
            };
        };
        groupedQueries: {
            [key: string]: {
                [key: string]: QueryDetails;
            };
        };
    };
    cCacheHits: number;
    cCacheMisses: string[];
    cCacheUncached: number;
}
