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

export function initNetworkLogging(options?: { enabled?: boolean }) {
    const isDev = typeof __DEV__ !== "undefined"
        ? __DEV__
        : typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production";

    if (options?.enabled === false || (options?.enabled === undefined && !isDev)) {
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
            this._networkId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            this._method = (method || "GET").toUpperCase();
            this._url = url || "";
            this._headers = {};
            this._completed = false;
            return originalOpen.apply(this, arguments as any);
        };

        XHR.prototype.setRequestHeader = function (header: string, value: string) {
            if (!this._headers) {
                this._headers = {};
            }
            this._headers[header] = value;
            return originalSetRequestHeader.apply(this, arguments as any);
        };

        XHR.prototype.send = function (data: any) {
            const id = this._networkId || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            this._networkId = id;

            const method = (this._method || (this as any)._method || "GET").toUpperCase();
            const rawUrl = this._url || (this as any)._url || "";
            const now = new Date();
            const timeFormatted = now.toTimeString().split(" ")[0];

            const { endpoint, baseUrl, queryParams } = parseUrlParts(rawUrl);

            let parsedData = data;
            if (typeof data === "string") {
                try {
                    parsedData = JSON.parse(data);
                } catch {}
            }

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
                requestData: parsedData,
                headers: this._headers || {},
            };

            addNetworkLog(logItem);

            const startTime = Date.now();

            const handleFinish = () => {
                if (this._completed) {
                    return;
                }
                this._completed = true;

                const duration = Date.now() - startTime;
                const status = typeof this.status === "number" ? this.status : 0;

                let responseData: any = this.response;
                if (responseData === undefined || responseData === null || responseData === "") {
                    responseData = (this as any)._response || this.responseText;
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
            };

            if (typeof this.addEventListener === "function") {
                this.addEventListener("loadend", handleFinish);
                this.addEventListener("error", handleFinish);
                this.addEventListener("timeout", handleFinish);
                this.addEventListener("abort", handleFinish);
            }

            const originalOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function () {
                if (this.readyState === 4) {
                    handleFinish();
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
            const rawUrl = typeof args[0] === "string" ? args[0] : (args[0]?.url || "");
            const init = args[1] || {};
            const method = (init.method || "GET").toUpperCase();
            const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const now = new Date();
            const timeFormatted = now.toTimeString().split(" ")[0];

            const { endpoint, baseUrl, queryParams } = parseUrlParts(rawUrl);

            let parsedBody = init.body;
            if (typeof init.body === "string") {
                try {
                    parsedBody = JSON.parse(init.body);
                } catch {}
            }

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
                requestData: parsedBody,
                headers: init.headers || {},
            };

            addNetworkLog(logItem);
            const startTime = Date.now();

            try {
                const response = await originalFetch.apply(this, args);
                const duration = Date.now() - startTime;
                const status = response.status;
                const isSuccess = status >= 200 && status < 400;

                const cloned = response.clone();
                cloned.text().then((text: string) => {
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
                }).catch(() => {
                    updateNetworkLog(id, {
                        status,
                        duration,
                        state: isSuccess ? "success" : "error",
                        errorMessage: !isSuccess ? (response.statusText || `Status ${status}`) : undefined,
                    });
                });

                return response;
            } catch (error: any) {
                const duration = Date.now() - startTime;
                updateNetworkLog(id, {
                    duration,
                    state: "error",
                    errorMessage: error?.message || "Falha na requisição",
                });
                throw error;
            }
        };
    }
}
