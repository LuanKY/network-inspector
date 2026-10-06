export interface NetworkRequestLog {
    id: string;
    label: string;
    method: string;
    url: string;
    fullUrl: string;
    endpoint: string;
    baseUrl: string;
    status?: number;
    duration?: number;
    timeFormatted: string;
    state: "pending" | "success" | "error";
    queryParams?: Record<string, string>;
    requestData?: any;
    responseData?: any;
    errorData?: any;
    errorMessage?: string;
    headers?: any;
}
type Listener = () => void;
export declare function getNetworkLogs(): NetworkRequestLog[];
export declare function clearNetworkLogs(): void;
export declare function subscribeNetworkLogs(listener: Listener): () => void;
export declare function addNetworkLog(newLog: NetworkRequestLog): void;
export declare function updateNetworkLog(id: string, updates: Partial<NetworkRequestLog>): void;
export declare function parseUrlParts(rawUrl: string): {
    endpoint: string;
    baseUrl: string;
    queryParams: Record<string, string> | undefined;
};
export declare function initNetworkLogging(options?: {
    enabled?: boolean;
}): void;
export {};
