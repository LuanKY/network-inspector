declare const __DEV__: boolean | undefined;
declare const process: any;

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

let logs: NetworkRequestLog[] = [];
const listeners: Set<Listener> = new Set();

const SYM_ID = Symbol("__ni_id");
const SYM_METHOD = Symbol("__ni_method");
const SYM_URL = Symbol("__ni_url");
const SYM_HEADERS = Symbol("__ni_headers");
const SYM_COMPLETED = Symbol("__ni_completed");
const SYM_START_TIME = Symbol("__ni_start_time");

function notify() {
    listeners.forEach((listener) => {
        try {
            listener();
        } catch {}
    });
}

export function getNetworkLogs(): NetworkRequestLog[] {
    return [...logs];
}

export function clearNetworkLogs() {
    logs = [];
    notify();
}

export function subscribeNetworkLogs(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function addNetworkLog(newLog: NetworkRequestLog) {
    logs = [newLog, ...logs].slice(0, 200);
    notify();
}

export function updateNetworkLog(id: string, updates: Partial<NetworkRequestLog>) {
    logs = logs.map((item) => {
        if (item.id === id) {
            return {
                ...item,
                ...updates,
            };
        }
        return item;
    });
    notify();
}

export function parseUrlParts(rawUrl: string) {
    const urlString = rawUrl || "";
    let endpoint = urlString;
    let baseUrl = "";
    let queryParams: Record<string, string> = {};

    try {
        const [pathAndBase, queryString] = urlString.split("?");

        if (queryString) {
            queryString.split("&").forEach((part) => {
                const [key, value] = part.split("=");
                if (key) {
                    queryParams[decodeURIComponent(key)] = decodeURIComponent(value || "");
                }
            });
        }

        const match = pathAndBase.match(/^(https?:\/\/[^\/]+)(.*)$/);
        if (match) {
            baseUrl = match[1];
            endpoint = match[2] || "/";
        } else {
            endpoint = pathAndBase;
        }
    } catch {
        endpoint = urlString;
    }

    return {
        endpoint: endpoint || "/",
        baseUrl,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    };
}

function parseHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    if (!headers) {
        return result;
    }
    try {
        if (typeof headers.forEach === "function") {
            headers.forEach((val: any, key: string) => {
                if (key) {
                    result[key] = String(val);
                }
            });
        } else if (Array.isArray(headers)) {
            headers.forEach((item) => {
                if (Array.isArray(item) && item[0]) {
                    result[item[0]] = String(item[1] ?? "");
                }
            });
        } else if (typeof headers === "object") {
            Object.keys(headers).forEach((key) => {
                result[key] = String(headers[key]);
            });
        }
    } catch {}
    return result;
}

function parseBody(data: any): any {
    if (data === undefined || data === null) {
        return undefined;
    }
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }
    try {
        if (typeof FormData !== "undefined" && data instanceof FormData) {
            return "[FormData]";
        }
        if (typeof Blob !== "undefined" && data instanceof Blob) {
            return `[Blob: ${data.size} bytes]`;
        }
        if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
            return `[ArrayBuffer: ${data.byteLength} bytes]`;
        }
    } catch {}
    return data;
}

export function initNetworkLogging(options?: { enabled?: boolean }) {
    if (options?.enabled === false) {
        return;
    }

    const globalObj = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {}) as any;
    if (globalObj.__universalNetworkLoggerReady) {
        return;
    }
    globalObj.__universalNetworkLoggerReady = true;

    const XHR = globalObj.XMLHttpRequest;
    if (XHR && XHR.prototype) {
        const originalOpen = XHR.prototype.open;
        const originalSend = XHR.prototype.send;
        const originalSetRequestHeader = XHR.prototype.setRequestHeader;

        XHR.prototype.open = function (method: string, url: string) {
            try {
                this[SYM_ID] = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                this[SYM_METHOD] = (method || "GET").toUpperCase();
                this[SYM_URL] = typeof url === "string" ? url : String(url || "");
                this[SYM_HEADERS] = {};
                this[SYM_COMPLETED] = false;
            } catch {}
            return originalOpen.apply(this, arguments as any);
        };

        XHR.prototype.setRequestHeader = function (header: string, value: string) {
            try {
                if (!this[SYM_HEADERS]) {
                    this[SYM_HEADERS] = {};
                }
                this[SYM_HEADERS][header] = value;
            } catch {}
            return originalSetRequestHeader.apply(this, arguments as any);
        };

        XHR.prototype.send = function (data: any) {
            const id = this[SYM_ID] || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            this[SYM_ID] = id;
            this[SYM_START_TIME] = Date.now();

            const method = this[SYM_METHOD] || "GET";
            const rawUrl = this[SYM_URL] || "";
            const now = new Date();
            const timeFormatted = now.toTimeString().split(" ")[0];

            const { endpoint, baseUrl, queryParams } = parseUrlParts(rawUrl);
            const headers = parseHeaders(this[SYM_HEADERS]);
            const requestData = parseBody(data);

            const logItem: NetworkRequestLog = {
                id,
                label: "XHR",
                method,
                url: rawUrl,
                fullUrl: rawUrl,
                endpoint,
                baseUrl,
                timeFormatted,
                state: "pending",
                queryParams,
                requestData,
                headers,
            };

            try {
                addNetworkLog(logItem);
            } catch {}

            const handleFinish = () => {
                if (this[SYM_COMPLETED]) {
                    return;
                }
                this[SYM_COMPLETED] = true;

                try {
                    const startTime = this[SYM_START_TIME] || Date.now();
                    const duration = Date.now() - startTime;
                    const status = typeof this.status === "number" ? this.status : 0;

                    let responseData: any = undefined;
                    try {
                        const type = this.responseType || "";
                        if (type === "" || type === "text") {
                            responseData = this.responseText;
                        } else if (type === "json") {
                            responseData = this.response;
                        } else if (type === "blob") {
                            responseData = `[Blob: ${this.response?.size || 0} bytes]`;
                        } else if (type === "arraybuffer") {
                            responseData = `[ArrayBuffer: ${this.response?.byteLength || 0} bytes]`;
                        } else {
                            responseData = this.response;
                        }
                    } catch {
                        try {
                            responseData = this.response;
                        } catch {}
                    }

                    if (typeof responseData === "string") {
                        try {
                            responseData = JSON.parse(responseData);
                        } catch {}
                    }

                    const isSuccess = status >= 200 && status < 400;

                    updateNetworkLog(id, {
                        status,
                        duration,
                        state: isSuccess ? "success" : "error",
                        responseData: isSuccess ? responseData : undefined,
                        errorData: !isSuccess ? responseData : undefined,
                        errorMessage: !isSuccess ? (this.statusText || `Status ${status}`) : undefined,
                    });
                } catch {}
            };

            try {
                if (typeof this.addEventListener === "function") {
                    this.addEventListener("loadend", handleFinish);
                    this.addEventListener("load", handleFinish);
                    this.addEventListener("error", handleFinish);
                    this.addEventListener("timeout", handleFinish);
                    this.addEventListener("abort", handleFinish);
                    this.addEventListener("readystatechange", () => {
                        if (this.readyState === 4) {
                            handleFinish();
                        }
                    });
                }
            } catch {}

            const originalOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function () {
                if (this.readyState === 4) {
                    try {
                        handleFinish();
                    } catch {}
                }
                if (typeof originalOnReadyStateChange === "function") {
                    return originalOnReadyStateChange.apply(this, arguments as any);
                }
            };

            return originalSend.apply(this, arguments as any);
        };
    }

    if (typeof globalObj.fetch === "function") {
        const originalFetch = globalObj.fetch;

        globalObj.fetch = async function (...args: any[]) {
            let rawUrl = "";
            let method = "GET";
            let headers: Record<string, string> = {};
            let bodyData: any = undefined;

            try {
                const input = args[0];
                const init = args[1] || {};

                if (typeof input === "string") {
                    rawUrl = input;
                } else if (input && typeof input === "object") {
                    rawUrl = input.url || "";
                    if (input.method) {
                        method = input.method;
                    }
                    if (input.headers) {
                        headers = parseHeaders(input.headers);
                    }
                }

                if (init.method) {
                    method = init.method;
                }
                if (init.headers) {
                    headers = { ...headers, ...parseHeaders(init.headers) };
                }
                if (init.body !== undefined) {
                    bodyData = init.body;
                }
            } catch {}

            method = (method || "GET").toUpperCase();
            const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const now = new Date();
            const timeFormatted = now.toTimeString().split(" ")[0];
            const { endpoint, baseUrl, queryParams } = parseUrlParts(rawUrl);
            const requestData = parseBody(bodyData);

            const logItem: NetworkRequestLog = {
                id,
                label: "FETCH",
                method,
                url: rawUrl,
                fullUrl: rawUrl,
                endpoint,
                baseUrl,
                timeFormatted,
                state: "pending",
                queryParams,
                requestData,
                headers,
            };

            try {
                addNetworkLog(logItem);
            } catch {}

            const startTime = Date.now();

            try {
                const response = await originalFetch.apply(this, args);
                const duration = Date.now() - startTime;
                const status = response.status;
                const isSuccess = status >= 200 && status < 400;

                (async () => {
                    try {
                        const cloned = response.clone();
                        const text = await cloned.text();
                        let parsedResponse: any = text;
                        try {
                            parsedResponse = JSON.parse(text);
                        } catch {}

                        updateNetworkLog(id, {
                            status,
                            duration,
                            state: isSuccess ? "success" : "error",
                            responseData: isSuccess ? parsedResponse : undefined,
                            errorData: !isSuccess ? parsedResponse : undefined,
                            errorMessage: !isSuccess ? (response.statusText || `Status ${status}`) : undefined,
                        });
                    } catch {
                        updateNetworkLog(id, {
                            status,
                            duration,
                            state: isSuccess ? "success" : "error",
                            errorMessage: !isSuccess ? (response.statusText || `Status ${status}`) : undefined,
                        });
                    }
                })();

                return response;
            } catch (error: any) {
                try {
                    const duration = Date.now() - startTime;
                    updateNetworkLog(id, {
                        duration,
                        state: "error",
                        errorMessage: error?.message || "Falha na requisição",
                    });
                } catch {}
                throw error;
            }
        };
    }
}
