"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkItemCard = void 0;
const vector_icons_1 = require("@expo/vector-icons");
const Clipboard = __importStar(require("expo-clipboard"));
const react_1 = __importStar(require("react"));
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
            await Clipboard.setStringAsync(text);
            setCopiedKey(key);
            setTimeout(() => {
                setCopiedKey((prev) => (prev === key ? null : prev));
            }, 2000);
        }
        catch { }
    };
    const renderCodeViewer = (isFullModal = false) => {
        const prefix = isFullModal ? "modal" : "inline";
        return (<react_native_1.ScrollView nestedScrollEnabled style={[styles.codeScroll, isFullModal && styles.codeScrollModal]}>
                {tab === "response" && (<react_native_1.View style={styles.codeContentBox}>
                        <react_native_1.View style={styles.fieldHeaderRow}>
                            <react_native_1.Text style={styles.fieldHeaderTitle}>
                                Resposta
                            </react_native_1.Text>
                            <react_native_1.TouchableOpacity onPress={() => handleCopy(formatContent(rawResponse), `resp_${prefix}`)} style={styles.fieldCopyButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                <vector_icons_1.MaterialCommunityIcons name={copiedKey === `resp_${prefix}` ? "check" : "content-copy"} size={13} color={copiedKey === `resp_${prefix}` ? "#10B981" : "#94A3B8"}/>
                                <react_native_1.Text style={[
                    styles.fieldCopyText,
                    copiedKey === `resp_${prefix}` && styles.fieldCopyTextSuccess,
                ]}>
                                    {copiedKey === `resp_${prefix}` ? "Copiado" : "Copiar"}
                                </react_native_1.Text>
                            </react_native_1.TouchableOpacity>
                        </react_native_1.View>

                        {item.errorMessage && (<react_native_1.View style={styles.errorBanner}>
                                <react_native_1.View style={styles.bannerHeaderRow}>
                                    <react_native_1.Text style={styles.errorBannerText} selectable={true}>
                                        Erro: {item.errorMessage}
                                    </react_native_1.Text>
                                    <react_native_1.TouchableOpacity onPress={() => handleCopy(item.errorMessage || "", `err_${prefix}`)} style={styles.fieldCopyButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                        <vector_icons_1.MaterialCommunityIcons name={copiedKey === `err_${prefix}` ? "check" : "content-copy"} size={13} color={copiedKey === `err_${prefix}` ? "#86EFAC" : "#FCA5A5"}/>
                                        <react_native_1.Text style={[
                        styles.fieldCopyText,
                        { color: copiedKey === `err_${prefix}` ? "#86EFAC" : "#FCA5A5" },
                    ]}>
                                            {copiedKey === `err_${prefix}` ? "Copiado" : "Copiar"}
                                        </react_native_1.Text>
                                    </react_native_1.TouchableOpacity>
                                </react_native_1.View>
                            </react_native_1.View>)}
                        <react_native_1.Text style={styles.codeText} selectable={true}>
                            {formatContent(rawResponse)}
                        </react_native_1.Text>
                    </react_native_1.View>)}

                {tab === "request" && (<react_native_1.View style={styles.codeContentBox}>
                        {item.queryParams && (<react_native_1.View style={styles.subSection}>
                                <react_native_1.View style={styles.fieldHeaderRow}>
                                    <react_native_1.Text style={styles.subSectionTitle}>
                                        Query Parameters:
                                    </react_native_1.Text>
                                    <react_native_1.TouchableOpacity onPress={() => handleCopy(formatContent(item.queryParams), `query_${prefix}`)} style={styles.fieldCopyButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                        <vector_icons_1.MaterialCommunityIcons name={copiedKey === `query_${prefix}` ? "check" : "content-copy"} size={13} color={copiedKey === `query_${prefix}` ? "#10B981" : "#94A3B8"}/>
                                        <react_native_1.Text style={[
                        styles.fieldCopyText,
                        copiedKey === `query_${prefix}` && styles.fieldCopyTextSuccess,
                    ]}>
                                            {copiedKey === `query_${prefix}` ? "Copiado" : "Copiar"}
                                        </react_native_1.Text>
                                    </react_native_1.TouchableOpacity>
                                </react_native_1.View>
                                <react_native_1.Text style={styles.codeText} selectable={true}>
                                    {formatContent(item.queryParams)}
                                </react_native_1.Text>
                            </react_native_1.View>)}

                        {hasBody && (<react_native_1.View style={styles.subSection}>
                                <react_native_1.View style={styles.fieldHeaderRow}>
                                    <react_native_1.Text style={styles.subSectionTitle}>
                                        Corpo da Requisição (Body):
                                    </react_native_1.Text>
                                    <react_native_1.TouchableOpacity onPress={() => handleCopy(formatContent(item.requestData), `body_${prefix}`)} style={styles.fieldCopyButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                        <vector_icons_1.MaterialCommunityIcons name={copiedKey === `body_${prefix}` ? "check" : "content-copy"} size={13} color={copiedKey === `body_${prefix}` ? "#10B981" : "#94A3B8"}/>
                                        <react_native_1.Text style={[
                        styles.fieldCopyText,
                        copiedKey === `body_${prefix}` && styles.fieldCopyTextSuccess,
                    ]}>
                                            {copiedKey === `body_${prefix}` ? "Copiado" : "Copiar"}
                                        </react_native_1.Text>
                                    </react_native_1.TouchableOpacity>
                                </react_native_1.View>
                                <react_native_1.Text style={styles.codeText} selectable={true}>
                                    {formatContent(item.requestData)}
                                </react_native_1.Text>
                            </react_native_1.View>)}

                        {!item.queryParams && !hasBody && (<react_native_1.Text style={styles.emptyText}>
                                Requisição sem corpo ou parâmetros de query.
                            </react_native_1.Text>)}
                    </react_native_1.View>)}

                {tab === "headers" && (<react_native_1.View style={styles.codeContentBox}>
                        <react_native_1.View style={styles.fieldHeaderRow}>
                            <react_native_1.Text style={styles.subSectionTitle}>
                                Headers da Requisição:
                            </react_native_1.Text>
                            <react_native_1.TouchableOpacity onPress={() => handleCopy(formatContent(item.headers), `headers_${prefix}`)} style={styles.fieldCopyButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                <vector_icons_1.MaterialCommunityIcons name={copiedKey === `headers_${prefix}` ? "check" : "content-copy"} size={13} color={copiedKey === `headers_${prefix}` ? "#10B981" : "#94A3B8"}/>
                                <react_native_1.Text style={[
                    styles.fieldCopyText,
                    copiedKey === `headers_${prefix}` && styles.fieldCopyTextSuccess,
                ]}>
                                    {copiedKey === `headers_${prefix}` ? "Copiado" : "Copiar"}
                                </react_native_1.Text>
                            </react_native_1.TouchableOpacity>
                        </react_native_1.View>
                        <react_native_1.Text style={styles.codeText} selectable={true}>
                            {formatContent(item.headers)}
                        </react_native_1.Text>
                    </react_native_1.View>)}
            </react_native_1.ScrollView>);
    };
    return (<>
            <react_native_1.View style={styles.cardContainer}>
                <react_native_1.TouchableOpacity activeOpacity={0.75} onPress={() => setExpanded(!expanded)} style={styles.cardHeaderPressable}>
                    <react_native_1.View style={styles.topRow}>
                        <react_native_1.View style={styles.badgeRow}>
                            <react_native_1.View style={[styles.methodBadge, { backgroundColor: methodColor }]}>
                                <react_native_1.Text style={styles.methodBadgeText}>
                                    {method}
                                </react_native_1.Text>
                            </react_native_1.View>

                            <react_native_1.View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                                <react_native_1.Text style={[styles.statusBadgeText, { color: statusBadge.textColor }]}>
                                    {statusBadge.label}
                                </react_native_1.Text>
                            </react_native_1.View>

                            <react_native_1.View style={styles.durationBadge}>
                                <vector_icons_1.MaterialCommunityIcons name="clock-outline" size={13} color="#0284C7"/>
                                <react_native_1.Text style={styles.durationText}>
                                    {item.duration !== undefined ? `${item.duration}ms` : "--"}
                                </react_native_1.Text>
                            </react_native_1.View>
                        </react_native_1.View>

                        <react_native_1.View style={styles.timeRow}>
                            <react_native_1.Text style={styles.timeText}>
                                {item.timeFormatted}
                            </react_native_1.Text>
                            <react_native_1.View style={styles.chevronCircle}>
                                <vector_icons_1.FontAwesome5 name={expanded ? "chevron-up" : "chevron-down"} size={10} color="#64748B"/>
                            </react_native_1.View>
                        </react_native_1.View>
                    </react_native_1.View>

                    <react_native_1.View style={styles.urlBox}>
                        {item.baseUrl ? (<react_native_1.Text style={styles.baseUrlText} numberOfLines={1}>
                                {item.baseUrl}
                            </react_native_1.Text>) : null}
                        <react_native_1.View style={styles.endpointRow}>
                            <react_native_1.Text style={styles.endpointText} numberOfLines={expanded ? 10 : 2}>
                                {item.endpoint || item.url || "/"}
                            </react_native_1.Text>
                            <react_native_1.TouchableOpacity onPress={() => handleCopy(item.fullUrl || item.url || item.endpoint, `url_${item.id}`)} style={styles.copySmallButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <vector_icons_1.MaterialCommunityIcons name={copiedKey === `url_${item.id}` ? "check" : "content-copy"} size={14} color={copiedKey === `url_${item.id}` ? "#10B981" : "#64748B"}/>
                                {copiedKey === `url_${item.id}` && (<react_native_1.Text style={styles.copiedInlineText}>Copiado</react_native_1.Text>)}
                            </react_native_1.TouchableOpacity>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.TouchableOpacity>

                {expanded && (<react_native_1.View style={styles.expandedSection}>
                        <react_native_1.View style={styles.tabsRow}>
                            <react_native_1.View style={styles.tabsButtonGroup}>
                                <react_native_1.TouchableOpacity onPress={() => setTab("response")} style={[styles.tabButton, tab === "response" && styles.tabButtonActive]}>
                                    <react_native_1.Text style={[styles.tabButtonText, tab === "response" && styles.tabButtonTextActive]}>
                                        Resposta
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>

                                <react_native_1.TouchableOpacity onPress={() => setTab("request")} style={[styles.tabButton, tab === "request" && styles.tabButtonActive]}>
                                    <react_native_1.Text style={[styles.tabButtonText, tab === "request" && styles.tabButtonTextActive]}>
                                        {hasParams || hasBody ? "Payload •" : "Payload"}
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>

                                <react_native_1.TouchableOpacity onPress={() => setTab("headers")} style={[styles.tabButton, tab === "headers" && styles.tabButtonActive]}>
                                    <react_native_1.Text style={[styles.tabButtonText, tab === "headers" && styles.tabButtonTextActive]}>
                                        Headers
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>
                            </react_native_1.View>

                            <react_native_1.TouchableOpacity onPress={() => setFullScreenVisible(true)} style={styles.expandButton}>
                                <vector_icons_1.FontAwesome5 name="expand-alt" size={11} color="#4F46E5"/>
                                <react_native_1.Text style={styles.expandButtonText}>
                                    Expandir
                                </react_native_1.Text>
                            </react_native_1.TouchableOpacity>
                        </react_native_1.View>

                        {renderCodeViewer(false)}
                    </react_native_1.View>)}
            </react_native_1.View>

            <react_native_1.Modal visible={fullScreenVisible} animationType="slide" onRequestClose={() => setFullScreenVisible(false)}>
                <react_native_1.View style={[
            styles.fullModalContainer,
            {
                paddingTop: Math.max(insets.top, 24),
                paddingBottom: Math.max(insets.bottom, 12),
            },
        ]}>
                    <react_native_1.View style={styles.fullModalHeader}>
                        <react_native_1.View style={styles.fullModalInfo}>
                            <react_native_1.View style={styles.fullModalBadgeRow}>
                                <react_native_1.View style={[styles.methodBadge, { backgroundColor: methodColor }]}>
                                    <react_native_1.Text style={styles.methodBadgeText}>
                                        {method}
                                    </react_native_1.Text>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                                    <react_native_1.Text style={[styles.statusBadgeText, { color: statusBadge.textColor }]}>
                                        {statusBadge.label}
                                    </react_native_1.Text>
                                </react_native_1.View>
                                <react_native_1.Text style={styles.durationText}>
                                    {item.duration !== undefined ? `${item.duration}ms` : "--"}
                                </react_native_1.Text>
                            </react_native_1.View>
                            <react_native_1.View style={styles.endpointRow}>
                                <react_native_1.Text style={styles.fullModalEndpointText} numberOfLines={3}>
                                    {item.endpoint || item.url || "/"}
                                </react_native_1.Text>
                                <react_native_1.TouchableOpacity onPress={() => handleCopy(item.fullUrl || item.url || item.endpoint, `modal_url_${item.id}`)} style={styles.copySmallButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <vector_icons_1.MaterialCommunityIcons name={copiedKey === `modal_url_${item.id}` ? "check" : "content-copy"} size={14} color={copiedKey === `modal_url_${item.id}` ? "#10B981" : "#64748B"}/>
                                    {copiedKey === `modal_url_${item.id}` && (<react_native_1.Text style={styles.copiedInlineText}>Copiado</react_native_1.Text>)}
                                </react_native_1.TouchableOpacity>
                            </react_native_1.View>
                        </react_native_1.View>

                        <react_native_1.TouchableOpacity onPress={() => setFullScreenVisible(false)} style={styles.closeRoundButton}>
                            <vector_icons_1.FontAwesome5 name="times" size={14} color="#0F172A"/>
                        </react_native_1.TouchableOpacity>
                    </react_native_1.View>

                    <react_native_1.View style={styles.fullModalBody}>
                        <react_native_1.View style={styles.modalTabsRow}>
                            <react_native_1.View style={styles.tabsButtonGroup}>
                                <react_native_1.TouchableOpacity onPress={() => setTab("response")} style={[styles.tabButton, styles.modalTabButton, tab === "response" && styles.tabButtonActive]}>
                                    <react_native_1.Text style={[styles.tabButtonText, tab === "response" && styles.tabButtonTextActive]}>
                                        Resposta
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>

                                <react_native_1.TouchableOpacity onPress={() => setTab("request")} style={[styles.tabButton, styles.modalTabButton, tab === "request" && styles.tabButtonActive]}>
                                    <react_native_1.Text style={[styles.tabButtonText, tab === "request" && styles.tabButtonTextActive]}>
                                        Payload / Params
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>

                                <react_native_1.TouchableOpacity onPress={() => setTab("headers")} style={[styles.tabButton, styles.modalTabButton, tab === "headers" && styles.tabButtonActive]}>
                                    <react_native_1.Text style={[styles.tabButtonText, tab === "headers" && styles.tabButtonTextActive]}>
                                        Headers
                                    </react_native_1.Text>
                                </react_native_1.TouchableOpacity>
                            </react_native_1.View>
                        </react_native_1.View>

                        <react_native_1.View style={styles.fullCodeWrapper}>
                            {renderCodeViewer(true)}
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.Modal>
        </>);
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
