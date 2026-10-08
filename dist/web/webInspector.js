"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebNetworkInspector = initWebNetworkInspector;
const networkLogger_1 = require("../core/networkLogger");
let isWebInitialized = false;
function initWebNetworkInspector(options) {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }
    (0, networkLogger_1.initNetworkLogging)(options);
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
    let expandedId = null;
    let activeTabMap = {};
    let copiedKey = null;
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
            display: flex;
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
            font-size: 16px;
            font-weight: bold;
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
        }
        .log-card-header {
            padding: 14px;
            cursor: pointer;
            user-select: none;
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
            background: #F0F9FF;
            color: #0284C7;
            padding: 3px 7px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
        }
        .time-text {
            color: #64748B;
            font-size: 12px;
        }
        .url-box {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
        }
        .endpoint-text {
            font-size: 13px;
            font-weight: 700;
            color: #0F172A;
            word-break: break-all;
            margin: 0;
            text-align: left;
            flex: 1;
        }
        .copy-small-btn {
            background: #F1F5F9;
            border: 1px solid #E2E8F0;
            color: #64748B;
            padding: 3px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
        }
        .copy-small-btn.copied {
            color: #10B981;
            border-color: #A7F3D0;
            background: #ECFDF5;
        }
        .expanded-box {
            border-top: 1px solid #E2E8F0;
            background: #F8FAFC;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .tab-btn-group {
            display: flex;
            gap: 6px;
        }
        .tab-btn {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            color: #475569;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }
        .tab-btn.active {
            background: #6366F1;
            border-color: #6366F1;
            color: #FFFFFF;
        }
        .code-container {
            background: #0F172A;
            border-radius: 10px;
            border: 1px solid #1E293B;
            padding: 12px;
            max-height: 380px;
            overflow: auto;
            color: #F8FAFC;
            font-size: 12px;
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .code-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1E293B;
            padding-bottom: 6px;
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
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
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
            font-family: monospace;
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
            gap: 8px;
        }
    `;
    shadow.appendChild(styleEl);
    const rootContainer = document.createElement("div");
    shadow.appendChild(rootContainer);
    function getMethodColor(method) {
        switch (method) {
            case "GET": return "#059669";
            case "POST": return "#2563EB";
            case "PUT": return "#D97706";
            case "DELETE": return "#DC2626";
            case "PATCH": return "#7C3AED";
            default: return "#4B5563";
        }
    }
    function getStatusBadge(state, status) {
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
    function formatData(data) {
        if (data === undefined || data === null || data === "") {
            return "Nenhum dado retornado";
        }
        if (typeof data === "string") {
            return data;
        }
        try {
            return JSON.stringify(data, null, 2);
        }
        catch {
            return String(data);
        }
    }
    function copyToClipboard(text, key) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => { });
        }
        copiedKey = key;
        render();
        setTimeout(() => {
            if (copiedKey === key) {
                copiedKey = null;
                render();
            }
        }, 2000);
    }
    function render() {
        const logs = (0, networkLogger_1.getNetworkLogs)();
        const filteredLogs = logs.filter((item) => {
            const matchesSearch = !searchQuery ||
                item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.status && String(item.status).includes(searchQuery));
            const matchesMethod = activeFilter === "TODOS" ||
                (activeFilter === "ERROS" && (item.state === "error" || (item.status && item.status >= 400))) ||
                (item.method && item.method.toUpperCase() === activeFilter);
            return matchesSearch && matchesMethod;
        });
        rootContainer.innerHTML = "";
        const floatingBtn = document.createElement("div");
        floatingBtn.className = "floating-btn";
        floatingBtn.innerHTML = `
            <span>🌐 Rede</span>
            ${logs.length > 0 ? `<span class="floating-badge">${logs.length}</span>` : ""}
        `;
        floatingBtn.onclick = () => {
            isModalOpen = true;
            render();
        };
        rootContainer.appendChild(floatingBtn);
        if (!isModalOpen) {
            return;
        }
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop";
        backdrop.onclick = (e) => {
            if (e.target === backdrop) {
                isModalOpen = false;
                render();
            }
        };
        const card = document.createElement("div");
        card.className = "modal-card";
        const header = document.createElement("div");
        header.className = "modal-header";
        header.innerHTML = `
            <div class="header-top">
                <div class="header-title-box">
                    <span class="title-text">Monitor de Rede</span>
                    <span class="counter-badge">${filteredLogs.length}</span>
                </div>
                <button class="close-btn" id="btn-close-modal">✕</button>
            </div>
            <div class="search-bar">
                <span>🔍</span>
                <input class="search-input" id="search-input" placeholder="Filtrar por endpoint ou status..." value="${searchQuery}" />
            </div>
            <div class="filters-row">
                <div class="pills-scroll" id="pills-container"></div>
                <button class="clear-btn" id="btn-clear-logs">🗑 Limpar</button>
            </div>
        `;
        card.appendChild(header);
        const pillsContainer = header.querySelector("#pills-container");
        const methods = ["TODOS", "ERROS", "GET", "POST", "PUT", "PATCH", "DELETE"];
        methods.forEach((m) => {
            const btn = document.createElement("button");
            btn.className = `pill-btn ${activeFilter === m ? "active" : ""}`;
            btn.textContent = m;
            btn.onclick = () => {
                activeFilter = m;
                render();
            };
            pillsContainer.appendChild(btn);
        });
        const closeBtn = header.querySelector("#btn-close-modal");
        closeBtn.onclick = () => {
            isModalOpen = false;
            render();
        };
        const searchInput = header.querySelector("#search-input");
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            render();
            const reInput = shadow.querySelector("#search-input");
            if (reInput) {
                reInput.focus();
                reInput.setSelectionRange(searchQuery.length, searchQuery.length);
            }
        };
        const clearBtn = header.querySelector("#btn-clear-logs");
        clearBtn.onclick = () => {
            (0, networkLogger_1.clearNetworkLogs)();
            render();
        };
        const logsList = document.createElement("div");
        logsList.className = "logs-list";
        if (filteredLogs.length === 0) {
            logsList.innerHTML = `
                <div class="empty-state">
                    <span style="font-size: 32px;">🌐</span>
                    <strong style="color: #0F172A;">Nenhuma requisição encontrada</strong>
                    <span>As requisições feitas pela aplicação aparecerão aqui automaticamente.</span>
                </div>
            `;
        }
        else {
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
                urlRow.className = "url-box";
                const urlText = document.createElement("span");
                urlText.className = "endpoint-text";
                urlText.textContent = item.endpoint || item.url || "/";
                urlRow.appendChild(urlText);
                const copyUrlBtn = document.createElement("button");
                const isUrlCopied = copiedKey === `url_${item.id}`;
                copyUrlBtn.className = `copy-small-btn ${isUrlCopied ? "copied" : ""}`;
                copyUrlBtn.textContent = isUrlCopied ? "✓ Copiado" : "❐ Copiar";
                copyUrlBtn.onclick = (e) => {
                    e.stopPropagation();
                    copyToClipboard(item.fullUrl || item.url || item.endpoint, `url_${item.id}`);
                };
                urlRow.appendChild(copyUrlBtn);
                logHeader.appendChild(urlRow);
                logHeader.onclick = () => {
                    expandedId = isExpanded ? null : item.id;
                    render();
                };
                logCard.appendChild(logHeader);
                if (isExpanded) {
                    const expandedBox = document.createElement("div");
                    expandedBox.className = "expanded-box";
                    const tabsGroup = document.createElement("div");
                    tabsGroup.className = "tab-btn-group";
                    const tabResponseBtn = document.createElement("button");
                    tabResponseBtn.className = `tab-btn ${tab === "response" ? "active" : ""}`;
                    tabResponseBtn.textContent = "Resposta";
                    tabResponseBtn.onclick = () => {
                        activeTabMap[item.id] = "response";
                        render();
                    };
                    tabsGroup.appendChild(tabResponseBtn);
                    const tabRequestBtn = document.createElement("button");
                    tabRequestBtn.className = `tab-btn ${tab === "request" ? "active" : ""}`;
                    tabRequestBtn.textContent = "Payload / Params";
                    tabRequestBtn.onclick = () => {
                        activeTabMap[item.id] = "request";
                        render();
                    };
                    tabsGroup.appendChild(tabRequestBtn);
                    const tabHeadersBtn = document.createElement("button");
                    tabHeadersBtn.className = `tab-btn ${tab === "headers" ? "active" : ""}`;
                    tabHeadersBtn.textContent = "Headers";
                    tabHeadersBtn.onclick = () => {
                        activeTabMap[item.id] = "headers";
                        render();
                    };
                    tabsGroup.appendChild(tabHeadersBtn);
                    expandedBox.appendChild(tabsGroup);
                    const codeContainer = document.createElement("div");
                    codeContainer.className = "code-container";
                    if (tab === "response") {
                        const rawResp = item.responseData !== undefined && item.responseData !== null ? item.responseData : item.errorData;
                        const respStr = formatData(rawResp);
                        const codeHeader = document.createElement("div");
                        codeHeader.className = "code-header-row";
                        codeHeader.innerHTML = `
                            <span class="code-header-title">Resposta</span>
                        `;
                        const copyRespBtn = document.createElement("button");
                        const isRespCopied = copiedKey === `resp_${item.id}`;
                        copyRespBtn.className = `code-copy-btn ${isRespCopied ? "copied" : ""}`;
                        copyRespBtn.textContent = isRespCopied ? "✓ Copiado" : "❐ Copiar";
                        copyRespBtn.onclick = () => copyToClipboard(respStr, `resp_${item.id}`);
                        codeHeader.appendChild(copyRespBtn);
                        codeContainer.appendChild(codeHeader);
                        if (item.errorMessage) {
                            const errBanner = document.createElement("div");
                            errBanner.className = "error-banner";
                            errBanner.innerHTML = `<span>Erro: ${item.errorMessage}</span>`;
                            const copyErrBtn = document.createElement("button");
                            const isErrCopied = copiedKey === `err_${item.id}`;
                            copyErrBtn.className = `code-copy-btn ${isErrCopied ? "copied" : ""}`;
                            copyErrBtn.textContent = isErrCopied ? "✓ Copiado" : "❐ Copiar";
                            copyErrBtn.onclick = () => copyToClipboard(item.errorMessage || "", `err_${item.id}`);
                            errBanner.appendChild(copyErrBtn);
                            codeContainer.appendChild(errBanner);
                        }
                        const pre = document.createElement("pre");
                        pre.className = "code-text-pre";
                        pre.textContent = respStr;
                        codeContainer.appendChild(pre);
                    }
                    if (tab === "request") {
                        if (item.queryParams) {
                            const queryStr = formatData(item.queryParams);
                            const qHeader = document.createElement("div");
                            qHeader.className = "code-header-row";
                            qHeader.innerHTML = `<span class="code-header-title">Query Parameters</span>`;
                            const copyQBtn = document.createElement("button");
                            const isQCopied = copiedKey === `query_${item.id}`;
                            copyQBtn.className = `code-copy-btn ${isQCopied ? "copied" : ""}`;
                            copyQBtn.textContent = isQCopied ? "✓ Copiado" : "❐ Copiar";
                            copyQBtn.onclick = () => copyToClipboard(queryStr, `query_${item.id}`);
                            qHeader.appendChild(copyQBtn);
                            codeContainer.appendChild(qHeader);
                            const preQ = document.createElement("pre");
                            preQ.className = "code-text-pre";
                            preQ.textContent = queryStr;
                            codeContainer.appendChild(preQ);
                        }
                        if (item.requestData !== undefined && item.requestData !== null && item.requestData !== "") {
                            const bodyStr = formatData(item.requestData);
                            const bHeader = document.createElement("div");
                            bHeader.className = "code-header-row";
                            bHeader.innerHTML = `<span class="code-header-title">Corpo da Requisição (Body)</span>`;
                            const copyBBtn = document.createElement("button");
                            const isBCopied = copiedKey === `body_${item.id}`;
                            copyBBtn.className = `code-copy-btn ${isBCopied ? "copied" : ""}`;
                            copyBBtn.textContent = isBCopied ? "✓ Copiado" : "❐ Copiar";
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
                        copyHBtn.textContent = isHCopied ? "✓ Copiado" : "❐ Copiar";
                        copyHBtn.onclick = () => copyToClipboard(headersStr, `headers_${item.id}`);
                        hHeader.appendChild(copyHBtn);
                        codeContainer.appendChild(hHeader);
                        const preH = document.createElement("pre");
                        preH.className = "code-text-pre";
                        preH.textContent = headersStr;
                        codeContainer.appendChild(preH);
                    }
                    expandedBox.appendChild(codeContainer);
                    logCard.appendChild(expandedBox);
                }
                logsList.appendChild(logCard);
            });
        }
        card.appendChild(logsList);
        backdrop.appendChild(card);
        rootContainer.appendChild(backdrop);
    }
    (0, networkLogger_1.subscribeNetworkLogs)(render);
    render();
}
