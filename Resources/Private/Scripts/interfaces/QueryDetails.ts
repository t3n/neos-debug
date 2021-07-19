export default interface QueryDetails {
    executionTimeSum: number;
    count: number;
    params: {
        [key: string]: any;
    };
}
