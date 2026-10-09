import {
    clearNetworkLogs,
    getNetworkLogs,
    initNetworkLogging,
    NetworkRequestLog,
    subscribeNetworkLogs,
} from "../core/networkLogger";

let isWebInitialized = false;

const ICONS = {
    networkWired: (color = "currentColor", size = 14) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 640 512" fill="${color}" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><path d="M640 264v-16c0-8.84-7.16-16-16-16H344v-40h72c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H224c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h72v40H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h112v40H80c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h144c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-48v-40h288v40h-48c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h144c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-48v-40h112c8.84 0 16-7.16 16-16zM240 48h160v96H240V48zm-144 320h112v96H96v-96zm448 96H432v-96h112v96z"/></svg>`,
    magnify: (color = "#6366F1", size = 18) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    close: (color = "#475569", size = 14) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    closeCircle: (color = "#94A3B8", size = 15) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;cursor:pointer;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    trash: (color = "#DC2626", size = 14) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    wifiArrows: (color = "#6366F1", size = 38) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;flex-shrink:0;"><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 13a11 11 0 0 1 14 0"/><path d="M8.5 17a6 6 0 0 1 7 0"/><path d="M12 20h.01"/><path d="M7 2v5M4 4.5 7 2l3 2.5"/><path d="M17 7V2m-3 2.5 3 2.5 3-2.5"/></svg>`,
    copy: (color = "currentColor", size = 12) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    check: (color = "#10B981", size = 12) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>`,
};

export function initWebNetworkInspector(options?: { enabled?: boolean }) {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }

    initNetworkLogging(options);

    if (isWebInitialized) {
        return;
    }
    isWebInitialized = true;

    const host = document.createElement("div");
    host.id = "network-inspector-host";

    const mountHost = () => {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", mountHost, { once: true });
            return;
        }
        if (!document.getElementById("network-inspector-host")) {
            document.body.appendChild(host);
        }
    };
    mountHost();

    const shadow = host.attachShadow({ mode: "open" });

    let isModalOpen = false;
    let searchQuery = "";
    let activeFilter = "TODOS";
    let expandedId: string | null = null;
    let activeTabMap: Record<string, "response" | "request" | "headers"> = {};
    let copiedKey: string | null = null;

    const styleEl = document.createElement("style");
    styleEl.textContent = `
        * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .floating-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1E293B;
            border: 1px solid #334155;
            color: #FFFFFF;
            border-radius: 9999px;
            padding: 9px 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            z-index: 2147483647;
            font-size: 13px;
            font-weight: 700;
            user-select: none;
            transition: transform 0.15s ease, background 0.15s ease;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }
        .floating-btn:hover {
            background: #334155;
            transform: scale(1.03);
        }
        .floating-badge {
            background: #EF4444;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            line-height: 1;
        }
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.65);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2147483647;
            padding: 16px;
        }
        .modal-card {
            background: #F8FAFC;
            width: 100%;
            max-width: 900px;
            height: 85vh;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #E2E8F0;
        }
        .modal-header {
            background: #FFFFFF;
            border-bottom: 1px solid #E2E8F0;
            padding: 14px 18px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-title-box {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .icon-circle {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #EEF2FF;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .title-text {
            font-size: 17px;
            font-weight: 700;
            color: #0F172A;
            margin: 0;
        }
        .counter-badge {
            background: #EEF2FF;
            color: #4F46E5;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 8px;
            border: 1px solid #C7D2FE;
        }
        .close-btn {
            background: #F1F5F9;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #475569;
            transition: background 0.15s ease;
        }
        .close-btn:hover {
            background: #E2E8F0;
        }
        .search-bar {
            display: flex;
            align-items: center;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 6px 12px;
            gap: 8px;
        }
        .search-input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 13px;
            color: #0F172A;
            width: 100%;
        }
        .filters-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .pills-scroll {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 2px;
        }
        .pill-btn {
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
            color: #475569;
            padding: 5px 12px;
            border-radius: 14px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
        }
        .pill-btn.active {
            background: #6366F1;
            border-color: #6366F1;
            color: #FFFFFF;
        }
        .clear-btn {
            background: #FEE2E2;
            border: 1px solid #FECACA;
            color: #DC2626;
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background 0.15s ease;
        }
        .clear-btn:hover {
            background: #FCA5A5;
        }
        .logs-list {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .log-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .log-card-header {
            padding: 14px;
            cursor: pointer;
            user-select: none;
            transition: background 0.1s ease;
        }
        .log-card-header:hover {
            background: #F8FAFC;
        }
        .card-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .badges-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .method-badge {
            padding: 3px 8px;
            border-radius: 6px;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
        }
        .status-badge {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
        }
        .duration-badge {
            color: #64748B;
            font-size: 11px;
            font-weight: 600;
            background: #F1F5F9;
            padding: 3px 6px;
            border-radius: 4px;
        }
        .time-text {
            color: #94A3B8;
            font-size: 11px;
            font-weight: 600;
        }
        .url-row {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .endpoint-text {
            color: #0F172A;
            font-size: 13px;
            font-weight: 700;
            word-break: break-all;
        }
        .base-url-text {
            color: #64748B;
            font-size: 11px;
            word-break: break-all;
        }
        .expanded-box {
            border-top: 1px solid #E2E8F0;
            background: #F8FAFC;
            display: flex;
            flex-direction: column;
        }
        .tabs-header {
            display: flex;
            border-bottom: 1px solid #E2E8F0;
            background: #FFFFFF;
        }
        .tab-btn {
            flex: 1;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            font-weight: 700;
            color: #64748B;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .tab-btn.active {
            color: #6366F1;
            border-bottom-color: #6366F1;
            background: #EEF2FF;
        }
        .tab-content {
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .code-container {
            background: #0F172A;
            border-radius: 8px;
            padding: 12px;
            color: #E2E8F0;
            font-size: 12px;
            line-height: 1.5;
            max-height: 280px;
            overflow-y: auto;
            position: relative;
        }
        .code-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1E293B;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }
        .code-header-title {
            color: #94A3B8;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .code-copy-btn {
            background: #1E293B;
            border: 1px solid #334155;
            color: #94A3B8;
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s ease;
        }
        .code-copy-btn:hover {
            color: #FFFFFF;
            border-color: #64748B;
        }
        .code-copy-btn.copied {
            color: #10B981;
            border-color: #10B981;
        }
        .error-banner {
            background: #7F1D1D;
            color: #FCA5A5;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .code-text-pre {
            margin: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            white-space: pre-wrap;
            word-break: break-all;
            user-select: text;
        }
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 16px;
            color: #64748B;
            gap: 6px;
            text-align: center;
        }
        .empty-icon-circle {
            width: 68px;
            height: 68px;
            border-radius: 34px;
            background: #EEF2FF;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 6px;
        }
    `;
    shadow.appendChild(styleEl);

    const rootContainer = document.createElement("div");
    shadow.appendChild(rootContainer);

    function getMethodColor(method: string) {
        switch (method) {
            case "GET": return "#059669";
            case "POST": return "#2563EB";
            case "PUT": return "#D97706";
            case "DELETE": return "#DC2626";
            case "PATCH": return "#7C3AED";
            default: return "#4B5563";
        }
    }

    function getStatusBadge(state: string, status?: number) {
        if (state === "pending" || !status) {
            return { bg: "#FEF3C7", color: "#B45309", label: "Pendente" };
        }
        if (status >= 200 && status < 300) {
            return { bg: "#D1FAE5", color: "#047857", label: `${status} OK` };
        }
        if (status >= 400 && status < 500) {
            return { bg: "#FEE2E2", color: "#B91C1C", label: `${status}` };
        }
        return { bg: "#FFE4E6", color: "#BE123C", label: `${status || "ERRO"}` };
    }

    function formatData(data: any) {
        if (data === undefined || data === null || data === "") {
            return "Nenhum dado retornado";
        }
        if (typeof data === "string") {
            return data;
        }
        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    }

    function copyToClipboard(text: string, key: string) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {});
        }
        copiedKey = key;
        renderListOnly();
        setTimeout(() => {
            if (copiedKey === key) {
                copiedKey = null;
                renderListOnly();
            }
        }, 2000);
    }

    const floatingBtn = document.createElement("div");
    floatingBtn.className = "floating-btn";
    floatingBtn.onclick = () => {
        isModalOpen = true;
        updateModalVisibility();
        renderListOnly();
    };
    rootContainer.appendChild(floatingBtn);

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.onclick = (e) => {
        if (e.target === backdrop) {
            isModalOpen = false;
            updateModalVisibility();
        }
    };

    const card = document.createElement("div");
    card.className = "modal-card";

    const header = document.createElement("div");
    header.className = "modal-header";
    header.innerHTML = `
        <div class="header-top">
            <div class="header-title-box">
                <div class="icon-circle">${ICONS.networkWired("#6366F1", 16)}</div>
                <span class="title-text">Monitor de Rede</span>
                <span class="counter-badge" id="modal-counter-badge">0</span>
            </div>
            <button class="close-btn" id="btn-close-modal">${ICONS.close("#475569", 14)}</button>
        </div>
        <div class="search-bar">
            ${ICONS.magnify("#6366F1", 18)}
            <input class="search-input" id="search-input" placeholder="Filtrar por endpoint ou status..." />
            <button id="btn-clear-search" style="display:none;background:none;border:none;cursor:pointer;padding:0;align-items:center;">${ICONS.closeCircle("#94A3B8", 15)}</button>
        </div>
        <div class="filters-row">
            <div class="pills-scroll" id="pills-container"></div>
            <button class="clear-btn" id="btn-clear-logs">
                ${ICONS.trash("#DC2626", 14)}
                <span>Limpar</span>
            </button>
        </div>
    `;
    card.appendChild(header);

    const logsList = document.createElement("div");
    logsList.className = "logs-list";
    card.appendChild(logsList);

    backdrop.appendChild(card);
    rootContainer.appendChild(backdrop);

    const counterBadge = header.querySelector("#modal-counter-badge") as HTMLElement;
    const closeBtn = header.querySelector("#btn-close-modal") as HTMLButtonElement;
    closeBtn.onclick = () => {
        isModalOpen = false;
        updateModalVisibility();
    };

    const searchInput = header.querySelector("#search-input") as HTMLInputElement;
    const clearSearchBtn = header.querySelector("#btn-clear-search") as HTMLButtonElement;

    searchInput.oninput = (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        clearSearchBtn.style.display = searchQuery ? "flex" : "none";
        renderListOnly();
    };

    clearSearchBtn.onclick = () => {
        searchQuery = "";
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        renderListOnly();
    };

    const pillsContainer = header.querySelector("#pills-container")!;
    const methods = ["TODOS", "ERROS", "GET", "POST", "PUT", "PATCH", "DELETE"];
    methods.forEach((m) => {
        const btn = document.createElement("button");
        btn.className = `pill-btn ${activeFilter === m ? "active" : ""}`;
        btn.textContent = m;
        btn.onclick = () => {
            activeFilter = m;
            pillsContainer.querySelectorAll(".pill-btn").forEach((p) => p.classList.remove("active"));
            btn.classList.add("active");
            renderListOnly();
        };
        pillsContainer.appendChild(btn);
    });

    const clearBtn = header.querySelector("#btn-clear-logs") as HTMLButtonElement;
    clearBtn.onclick = () => {
        clearNetworkLogs();
        renderListOnly();
    };

    function updateModalVisibility() {
        backdrop.style.display = isModalOpen ? "flex" : "none";
    }

    function renderFloatingButton() {
        const logs = getNetworkLogs();
        floatingBtn.innerHTML = `
            ${ICONS.networkWired("#FFFFFF", 14)}
            <span>Rede</span>
            ${logs.length > 0 ? `<span class="floating-badge">${logs.length}</span>` : ""}
        `;
    }

    function renderListOnly() {
        const logs = getNetworkLogs();
        renderFloatingButton();

        const filteredLogs = logs.filter((item) => {
            const matchesSearch =
                !searchQuery ||
                item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.status && String(item.status).includes(searchQuery));

            const matchesMethod =
                activeFilter === "TODOS" ||
                (activeFilter === "ERROS" && (item.state === "error" || (item.status && item.status >= 400))) ||
                (item.method && item.method.toUpperCase() === activeFilter);

            return matchesSearch && matchesMethod;
        });

        counterBadge.textContent = String(filteredLogs.length);
        logsList.innerHTML = "";

        if (filteredLogs.length === 0) {
            logsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon-circle">${ICONS.wifiArrows("#6366F1", 38)}</div>
                    <strong style="color: #0F172A; font-size: 15px;">Nenhuma requisição encontrada</strong>
                    <span style="font-size: 12px; color: #64748B;">As requisições feitas pela aplicação aparecerão aqui automaticamente.</span>
                </div>
            `;
            return;
        }

        filteredLogs.forEach((item) => {
            const methodColor = getMethodColor(item.method);
            const statusBadge = getStatusBadge(item.state, item.status);
            const isExpanded = expandedId === item.id;
            const tab = activeTabMap[item.id] || "response";

            const logCard = document.createElement("div");
            logCard.className = "log-card";

            const logHeader = document.createElement("div");
            logHeader.className = "log-card-header";

            const topRow = document.createElement("div");
            topRow.className = "card-top-row";
            topRow.innerHTML = `
                <div class="badges-group">
                    <span class="method-badge" style="background:${methodColor}">${item.method}</span>
                    <span class="status-badge" style="background:${statusBadge.bg}; color:${statusBadge.color}">${statusBadge.label}</span>
                    <span class="duration-badge">${item.duration !== undefined ? `${item.duration}ms` : "--"}</span>
                </div>
                <span class="time-text">${item.timeFormatted}</span>
            `;
            logHeader.appendChild(topRow);

            const urlRow = document.createElement("div");
            urlRow.className = "url-row";
            urlRow.innerHTML = `
                <span class="endpoint-text">${item.endpoint}</span>
                ${item.baseUrl ? `<span class="base-url-text">${item.baseUrl}</span>` : ""}
            `;
            logHeader.appendChild(urlRow);

            logHeader.onclick = () => {
                expandedId = isExpanded ? null : item.id;
                renderListOnly();
            };

            logCard.appendChild(logHeader);

            if (isExpanded) {
                const expandedBox = document.createElement("div");
                expandedBox.className = "expanded-box";

                const tabsHeader = document.createElement("div");
                tabsHeader.className = "tabs-header";

                const tabDefs: Array<{ id: "response" | "request" | "headers"; label: string }> = [
                    { id: "response", label: "Resposta" },
                    { id: "request", label: "Envio" },
                    { id: "headers", label: "Headers" },
                ];

                tabDefs.forEach((t) => {
                    const tBtn = document.createElement("button");
                    tBtn.className = `tab-btn ${tab === t.id ? "active" : ""}`;
                    tBtn.textContent = t.label;
                    tBtn.onclick = (e) => {
                        e.stopPropagation();
                        activeTabMap[item.id] = t.id;
                        renderListOnly();
                    };
                    tabsHeader.appendChild(tBtn);
                });
                expandedBox.appendChild(tabsHeader);

                const tabContent = document.createElement("div");
                tabContent.className = "tab-content";

                const codeContainer = document.createElement("div");
                codeContainer.className = "code-container";

                if (tab === "response") {
                    if (item.errorMessage) {
                        const errBanner = document.createElement("div");
                        errBanner.className = "error-banner";
                        errBanner.style.marginBottom = "8px";
                        errBanner.textContent = item.errorMessage;
                        tabContent.appendChild(errBanner);
                    }

                    const responsePayload = item.state === "error" ? (item.errorData || item.responseData) : item.responseData;
                    const responseStr = formatData(responsePayload);

                    const cHeader = document.createElement("div");
                    cHeader.className = "code-header-row";
                    cHeader.innerHTML = `<span class="code-header-title">Corpo da Resposta</span>`;
                    const copyBtn = document.createElement("button");
                    const isCopied = copiedKey === `res_${item.id}`;
                    copyBtn.className = `code-copy-btn ${isCopied ? "copied" : ""}`;
                    copyBtn.innerHTML = `${isCopied ? ICONS.check("#10B981", 12) : ICONS.copy("#94A3B8", 12)} <span>${isCopied ? "Copiado" : "Copiar"}</span>`;
                    copyBtn.onclick = () => copyToClipboard(responseStr, `res_${item.id}`);
                    cHeader.appendChild(copyBtn);
                    codeContainer.appendChild(cHeader);

                    const pre = document.createElement("pre");
                    pre.className = "code-text-pre";
                    pre.textContent = responseStr;
                    codeContainer.appendChild(pre);
                }

                if (tab === "request") {
                    if (item.queryParams && Object.keys(item.queryParams).length > 0) {
                        const qStr = formatData(item.queryParams);
                        const qHeader = document.createElement("div");
                        qHeader.className = "code-header-row";
                        qHeader.innerHTML = `<span class="code-header-title">Query Params</span>`;
                        const copyQBtn = document.createElement("button");
                        const isQCopied = copiedKey === `query_${item.id}`;
                        copyQBtn.className = `code-copy-btn ${isQCopied ? "copied" : ""}`;
                        copyQBtn.innerHTML = `${isQCopied ? ICONS.check("#10B981", 12) : ICONS.copy("#94A3B8", 12)} <span>${isQCopied ? "Copiado" : "Copiar"}</span>`;
                        copyQBtn.onclick = () => copyToClipboard(qStr, `query_${item.id}`);
                        qHeader.appendChild(copyQBtn);
                        codeContainer.appendChild(qHeader);

                        const preQ = document.createElement("pre");
                        preQ.className = "code-text-pre";
                        preQ.style.marginBottom = "12px";
                        preQ.textContent = qStr;
                        codeContainer.appendChild(preQ);
                    }

                    if (item.requestData !== undefined && item.requestData !== null && item.requestData !== "") {
                        const bodyStr = formatData(item.requestData);
                        const bHeader = document.createElement("div");
                        bHeader.className = "code-header-row";
                        bHeader.innerHTML = `<span class="code-header-title">Payload Enviado</span>`;
                        const copyBBtn = document.createElement("button");
                        const isBCopied = copiedKey === `body_${item.id}`;
                        copyBBtn.className = `code-copy-btn ${isBCopied ? "copied" : ""}`;
                        copyBBtn.innerHTML = `${isBCopied ? ICONS.check("#10B981", 12) : ICONS.copy("#94A3B8", 12)} <span>${isBCopied ? "Copiado" : "Copiar"}</span>`;
                        copyBBtn.onclick = () => copyToClipboard(bodyStr, `body_${item.id}`);
                        bHeader.appendChild(copyBBtn);
                        codeContainer.appendChild(bHeader);

                        const preB = document.createElement("pre");
                        preB.className = "code-text-pre";
                        preB.textContent = bodyStr;
                        codeContainer.appendChild(preB);
                    }

                    if (!item.queryParams && (item.requestData === undefined || item.requestData === null || item.requestData === "")) {
                        codeContainer.innerHTML = `<span style="color:#94A3B8;">Requisição sem corpo ou parâmetros de query.</span>`;
                    }
                }

                if (tab === "headers") {
                    const headersStr = formatData(item.headers);
                    const hHeader = document.createElement("div");
                    hHeader.className = "code-header-row";
                    hHeader.innerHTML = `<span class="code-header-title">Headers da Requisição</span>`;
                    const copyHBtn = document.createElement("button");
                    const isHCopied = copiedKey === `headers_${item.id}`;
                    copyHBtn.className = `code-copy-btn ${isHCopied ? "copied" : ""}`;
                    copyHBtn.innerHTML = `${isHCopied ? ICONS.check("#10B981", 12) : ICONS.copy("#94A3B8", 12)} <span>${isHCopied ? "Copiado" : "Copiar"}</span>`;
                    copyHBtn.onclick = () => copyToClipboard(headersStr, `headers_${item.id}`);
                    hHeader.appendChild(copyHBtn);
                    codeContainer.appendChild(hHeader);

                    const preH = document.createElement("pre");
                    preH.className = "code-text-pre";
                    preH.textContent = headersStr;
                    codeContainer.appendChild(preH);
                }

                tabContent.appendChild(codeContainer);
                expandedBox.appendChild(tabContent);
                logCard.appendChild(expandedBox);
            }

            logsList.appendChild(logCard);
        });
    }

    let renderTimer: any = null;
    subscribeNetworkLogs(() => {
        if (renderTimer) {
            return;
        }
        renderTimer = setTimeout(() => {
            renderTimer = null;
            renderListOnly();
        }, 60);
    });

    renderFloatingButton();
}
