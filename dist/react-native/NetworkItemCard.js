"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkItemCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const vector_icons_1 = require("@expo/vector-icons");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const getMethodColor = (method) => {
    switch (method) {
        case "GET":
            return "#059669";
        case "POST":
            return "#2563EB";
        case "PUT":
            return "#D97706";
        case "DELETE":
            return "#DC2626";
        case "PATCH":
            return "#7C3AED";
        default:
            return "#4B5563";
    }
};
const getStatusBadge = (state, status) => {
    if (state === "pending" || !status) {
        return {
            bg: "#FEF3C7",
            textColor: "#B45309",
            label: "Pendente",
        };
    }
    if (status >= 200 && status < 300) {
        return {
            bg: "#D1FAE5",
            textColor: "#047857",
            label: `${status} OK`,
        };
    }
    if (status >= 400 && status < 500) {
        return {
            bg: "#FEE2E2",
            textColor: "#B91C1C",
            label: `${status}`,
        };
    }
    return {
        bg: "#FFE4E6",
        textColor: "#BE123C",
        label: `${status || "ERRO"}`,
    };
};
const formatContent = (data) => {
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
};
const NetworkItemCard = ({ item }) => {
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const [fullScreenVisible, setFullScreenVisible] = (0, react_1.useState)(false);
    const [tab, setTab] = (0, react_1.useState)("response");
    const [copiedKey, setCopiedKey] = (0, react_1.useState)(null);
    const method = (item.method || "GET").toUpperCase();
    const methodColor = getMethodColor(method);
    const statusBadge = getStatusBadge(item.state, item.status);
    const hasParams = !!item.queryParams;
    const hasBody = item.requestData !== undefined && item.requestData !== null && item.requestData !== "";
    const rawResponse = item.responseData !== undefined && item.responseData !== null
        ? item.responseData
        : item.errorData;
    const handleCopy = async (text, key) => {
        try {
            const clipboardModuleName = ["expo", "clipboard"].join("-");
            let copied = false;
            try {
                const clipboardLib = require(clipboardModuleName);
                if (clipboardLib && typeof clipboardLib.setStringAsync === "function") {
                    await clipboardLib.setStringAsync(text);
                    copied = true;
                }
            }
            catch { }
            if (!copied) {
                try {
                    const rncLib = require("@react-native-clipboard/clipboard");
                    if (rncLib && typeof rncLib.setString === "function") {
                        rncLib.setString(text);
                        copied = true;
                    }
                }
                catch { }
            }
            if (!copied) {
                await react_native_1.Share.share({ message: text });
            }
            setCopiedKey(key);
            setTimeout(() => {
                setCopiedKey((prev) => (prev === key ? null : prev));
            }, 2000);
        }
        catch { }
    };
    const renderCodeViewer = (isFullModal = false) => {
        const prefix = isFullModal ? "modal" : "inline";
        return ((0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { nestedScrollEnabled: true, style: [styles.codeScroll, isFullModal && styles.codeScrollModal], children: [tab === "response" && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.codeContentBox, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fieldHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.fieldHeaderTitle, children: "Resposta" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(formatContent(rawResponse), `resp_${prefix}`), style: styles.fieldCopyButton, hitSlop: { top: 6, bottom: 6, left: 6, right: 6 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `resp_${prefix}` ? "check" : "content-copy", size: 13, color: copiedKey === `resp_${prefix}` ? "#10B981" : "#94A3B8" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                styles.fieldCopyText,
                                                copiedKey === `resp_${prefix}` && styles.fieldCopyTextSuccess,
                                            ], children: copiedKey === `resp_${prefix}` ? "Copiado" : "Copiar" })] })] }), item.errorMessage && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.errorBanner, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.bannerHeaderRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: styles.errorBannerText, selectable: true, children: ["Erro: ", item.errorMessage] }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(item.errorMessage || "", `err_${prefix}`), style: styles.fieldCopyButton, hitSlop: { top: 6, bottom: 6, left: 6, right: 6 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `err_${prefix}` ? "check" : "content-copy", size: 13, color: copiedKey === `err_${prefix}` ? "#86EFAC" : "#FCA5A5" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                    styles.fieldCopyText,
                                                    { color: copiedKey === `err_${prefix}` ? "#86EFAC" : "#FCA5A5" },
                                                ], children: copiedKey === `err_${prefix}` ? "Copiado" : "Copiar" })] })] }) })), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.codeText, selectable: true, children: formatContent(rawResponse) })] })), tab === "request" && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.codeContentBox, children: [item.queryParams && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.subSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fieldHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subSectionTitle, children: "Query Parameters:" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(formatContent(item.queryParams), `query_${prefix}`), style: styles.fieldCopyButton, hitSlop: { top: 6, bottom: 6, left: 6, right: 6 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `query_${prefix}` ? "check" : "content-copy", size: 13, color: copiedKey === `query_${prefix}` ? "#10B981" : "#94A3B8" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                        styles.fieldCopyText,
                                                        copiedKey === `query_${prefix}` && styles.fieldCopyTextSuccess,
                                                    ], children: copiedKey === `query_${prefix}` ? "Copiado" : "Copiar" })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.codeText, selectable: true, children: formatContent(item.queryParams) })] })), hasBody && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.subSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fieldHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subSectionTitle, children: "Corpo da Requisi\u00E7\u00E3o (Body):" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(formatContent(item.requestData), `body_${prefix}`), style: styles.fieldCopyButton, hitSlop: { top: 6, bottom: 6, left: 6, right: 6 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `body_${prefix}` ? "check" : "content-copy", size: 13, color: copiedKey === `body_${prefix}` ? "#10B981" : "#94A3B8" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                        styles.fieldCopyText,
                                                        copiedKey === `body_${prefix}` && styles.fieldCopyTextSuccess,
                                                    ], children: copiedKey === `body_${prefix}` ? "Copiado" : "Copiar" })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.codeText, selectable: true, children: formatContent(item.requestData) })] })), !item.queryParams && !hasBody && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emptyText, children: "Requisi\u00E7\u00E3o sem corpo ou par\u00E2metros de query." }))] })), tab === "headers" && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.codeContentBox, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fieldHeaderRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subSectionTitle, children: "Headers da Requisi\u00E7\u00E3o:" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(formatContent(item.headers), `headers_${prefix}`), style: styles.fieldCopyButton, hitSlop: { top: 6, bottom: 6, left: 6, right: 6 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `headers_${prefix}` ? "check" : "content-copy", size: 13, color: copiedKey === `headers_${prefix}` ? "#10B981" : "#94A3B8" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                                                styles.fieldCopyText,
                                                copiedKey === `headers_${prefix}` && styles.fieldCopyTextSuccess,
                                            ], children: copiedKey === `headers_${prefix}` ? "Copiado" : "Copiar" })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.codeText, selectable: true, children: formatContent(item.headers) })] }))] }));
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.cardContainer, children: [(0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { activeOpacity: 0.75, onPress: () => setExpanded(!expanded), style: styles.cardHeaderPressable, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.topRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.badgeRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.methodBadge, { backgroundColor: methodColor }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.methodBadgeText, children: method }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.statusBadge, { backgroundColor: statusBadge.bg }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.statusBadgeText, { color: statusBadge.textColor }], children: statusBadge.label }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.durationBadge, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: "clock-outline", size: 13, color: "#0284C7" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.durationText, children: item.duration !== undefined ? `${item.duration}ms` : "--" })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.timeRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.timeText, children: item.timeFormatted }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.chevronCircle, children: (0, jsx_runtime_1.jsx)(vector_icons_1.FontAwesome5, { name: expanded ? "chevron-up" : "chevron-down", size: 10, color: "#64748B" }) })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.urlBox, children: [item.baseUrl ? ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.baseUrlText, numberOfLines: 1, children: item.baseUrl })) : null, (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.endpointRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.endpointText, numberOfLines: expanded ? 10 : 2, children: item.endpoint || item.url || "/" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(item.fullUrl || item.url || item.endpoint, `url_${item.id}`), style: styles.copySmallButton, hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `url_${item.id}` ? "check" : "content-copy", size: 14, color: copiedKey === `url_${item.id}` ? "#10B981" : "#64748B" }), copiedKey === `url_${item.id}` && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.copiedInlineText, children: "Copiado" }))] })] })] })] }), expanded && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.expandedSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tabsRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tabsButtonGroup, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setTab("response"), style: [styles.tabButton, tab === "response" && styles.tabButtonActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabButtonText, tab === "response" && styles.tabButtonTextActive], children: "Resposta" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setTab("request"), style: [styles.tabButton, tab === "request" && styles.tabButtonActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabButtonText, tab === "request" && styles.tabButtonTextActive], children: hasParams || hasBody ? "Payload •" : "Payload" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setTab("headers"), style: [styles.tabButton, tab === "headers" && styles.tabButtonActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabButtonText, tab === "headers" && styles.tabButtonTextActive], children: "Headers" }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => setFullScreenVisible(true), style: styles.expandButton, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.FontAwesome5, { name: "expand-alt", size: 11, color: "#4F46E5" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.expandButtonText, children: "Expandir" })] })] }), renderCodeViewer(false)] }))] }), (0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: fullScreenVisible, animationType: "slide", onRequestClose: () => setFullScreenVisible(false), children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                        styles.fullModalContainer,
                        {
                            paddingTop: Math.max(insets.top, 24),
                            paddingBottom: Math.max(insets.bottom, 12),
                        },
                    ], children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fullModalHeader, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fullModalInfo, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fullModalBadgeRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.methodBadge, { backgroundColor: methodColor }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.methodBadgeText, children: method }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.statusBadge, { backgroundColor: statusBadge.bg }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.statusBadgeText, { color: statusBadge.textColor }], children: statusBadge.label }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.durationText, children: item.duration !== undefined ? `${item.duration}ms` : "--" })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.endpointRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.fullModalEndpointText, numberOfLines: 3, children: item.endpoint || item.url || "/" }), (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { onPress: () => handleCopy(item.fullUrl || item.url || item.endpoint, `modal_url_${item.id}`), style: styles.copySmallButton, hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }, children: [(0, jsx_runtime_1.jsx)(vector_icons_1.MaterialCommunityIcons, { name: copiedKey === `modal_url_${item.id}` ? "check" : "content-copy", size: 14, color: copiedKey === `modal_url_${item.id}` ? "#10B981" : "#64748B" }), copiedKey === `modal_url_${item.id}` && ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.copiedInlineText, children: "Copiado" }))] })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setFullScreenVisible(false), style: styles.closeRoundButton, children: (0, jsx_runtime_1.jsx)(vector_icons_1.FontAwesome5, { name: "times", size: 14, color: "#0F172A" }) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.fullModalBody, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.modalTabsRow, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.tabsButtonGroup, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setTab("response"), style: [styles.tabButton, styles.modalTabButton, tab === "response" && styles.tabButtonActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabButtonText, tab === "response" && styles.tabButtonTextActive], children: "Resposta" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setTab("request"), style: [styles.tabButton, styles.modalTabButton, tab === "request" && styles.tabButtonActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabButtonText, tab === "request" && styles.tabButtonTextActive], children: "Payload / Params" }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: () => setTab("headers"), style: [styles.tabButton, styles.modalTabButton, tab === "headers" && styles.tabButtonActive], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.tabButtonText, tab === "headers" && styles.tabButtonTextActive], children: "Headers" }) })] }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.fullCodeWrapper, children: renderCodeViewer(true) })] })] }) })] }));
};
exports.NetworkItemCard = NetworkItemCard;
const styles = react_native_1.StyleSheet.create({
    cardContainer: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 12,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    cardHeaderPressable: {
        padding: 14,
    },
    topRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    methodBadge: {
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    methodBadgeText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    statusBadge: {
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    durationBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#F0F9FF",
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 6,
    },
    durationText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#0284C7",
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#64748B",
    },
    chevronCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    urlBox: {
        width: "100%",
        alignItems: "flex-start",
        gap: 2,
    },
    baseUrlText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#64748B",
        textAlign: "left",
    },
    endpointRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
    },
    endpointText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "left",
    },
    copySmallButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 6,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    copiedInlineText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#10B981",
    },
    expandedSection: {
        width: "100%",
        borderTopWidth: 1,
        borderColor: "#E2E8F0",
        padding: 12,
        backgroundColor: "#F8FAFC",
    },
    tabsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        width: "100%",
    },
    tabsButtonGroup: {
        flexDirection: "row",
        gap: 6,
    },
    tabButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    tabButtonActive: {
        backgroundColor: "#6366F1",
        borderColor: "#6366F1",
    },
    tabButtonText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#475569",
    },
    tabButtonTextActive: {
        color: "#FFFFFF",
    },
    expandButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "#EEF2FF",
        borderWidth: 1,
        borderColor: "#C7D2FE",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    expandButtonText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#4F46E5",
    },
    codeScroll: {
        maxHeight: 320,
        backgroundColor: "#0F172A",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#1E293B",
    },
    codeScrollModal: {
        maxHeight: 560,
    },
    codeContentBox: {
        alignItems: "flex-start",
        width: "100%",
    },
    fieldHeaderRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    fieldHeaderTitle: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    fieldCopyButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 5,
        backgroundColor: "#1E293B",
        borderWidth: 1,
        borderColor: "#334155",
    },
    fieldCopyText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#94A3B8",
    },
    fieldCopyTextSuccess: {
        color: "#10B981",
    },
    errorBanner: {
        width: "100%",
        backgroundColor: "#7F1D1D",
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        alignItems: "flex-start",
    },
    bannerHeaderRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "bold",
        color: "#FCA5A5",
        textAlign: "left",
    },
    codeText: {
        fontSize: 12,
        color: "#F8FAFC",
        textAlign: "left",
        lineHeight: 18,
    },
    subSection: {
        alignItems: "flex-start",
        width: "100%",
        marginBottom: 12,
    },
    subSectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#38BDF8",
        textAlign: "left",
    },
    emptyText: {
        fontSize: 12,
        color: "#94A3B8",
        textAlign: "left",
    },
    fullModalContainer: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    fullModalHeader: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    fullModalInfo: {
        alignItems: "flex-start",
        gap: 4,
        width: "85%",
    },
    fullModalBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    fullModalEndpointText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "left",
    },
    closeRoundButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    fullModalBody: {
        padding: 14,
        flex: 1,
        width: "100%",
    },
    modalTabsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        width: "100%",
    },
    modalTabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    fullCodeWrapper: {
        flex: 1,
        width: "100%",
    },
});
exports.default = exports.NetworkItemCard;
