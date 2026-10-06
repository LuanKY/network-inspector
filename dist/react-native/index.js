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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkInspector = void 0;
const vector_icons_1 = require("@expo/vector-icons");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const networkLogger_1 = require("../core/networkLogger");
const NetworkItemCard_1 = __importDefault(require("./NetworkItemCard"));
__exportStar(require("../core/networkLogger"), exports);
__exportStar(require("./NetworkItemCard"), exports);
const NetworkInspector = () => {
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const [visible, setVisible] = (0, react_1.useState)(false);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [search, setSearch] = (0, react_1.useState)("");
    const [filterMethod, setFilterMethod] = (0, react_1.useState)("TODOS");
    (0, react_1.useEffect)(() => {
        (0, networkLogger_1.initNetworkLogging)();
        setLogs((0, networkLogger_1.getNetworkLogs)());
        const unsubscribe = (0, networkLogger_1.subscribeNetworkLogs)(() => {
            setLogs((0, networkLogger_1.getNetworkLogs)());
        });
        return unsubscribe;
    }, []);
    (0, react_1.useEffect)(() => {
        if (visible) {
            setLogs((0, networkLogger_1.getNetworkLogs)());
        }
    }, [visible]);
    const filteredLogs = (0, react_1.useMemo)(() => {
        return logs.filter((item) => {
            const matchesSearch = !search ||
                item.url.toLowerCase().includes(search.toLowerCase()) ||
                item.endpoint.toLowerCase().includes(search.toLowerCase()) ||
                (item.status && String(item.status).includes(search));
            const matchesMethod = filterMethod === "TODOS" ||
                (filterMethod === "ERROS" && (item.state === "error" || (item.status && item.status >= 400))) ||
                (item.method && item.method.toUpperCase() === filterMethod);
            return matchesSearch && matchesMethod;
        });
    }, [logs, search, filterMethod]);
    const paddingTop = Math.max(insets.top, 24);
    const paddingBottom = Math.max(insets.bottom, 12);
    return (<>
            <react_native_1.View style={styles.floatingButtonContainer} pointerEvents="box-none">
                <react_native_1.TouchableOpacity activeOpacity={0.85} onPress={() => setVisible(true)} style={styles.floatingButton}>
                    <vector_icons_1.FontAwesome5 name="network-wired" size={14} color="#FFFFFF"/>
                    <react_native_1.Text style={styles.floatingButtonText}>
                        Rede
                    </react_native_1.Text>
                    {logs.length > 0 && (<react_native_1.View style={styles.floatingBadge}>
                            <react_native_1.Text style={styles.floatingBadgeText}>
                                {logs.length}
                            </react_native_1.Text>
                        </react_native_1.View>)}
                </react_native_1.TouchableOpacity>
            </react_native_1.View>

            <react_native_1.Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
                <react_native_1.View style={[
            styles.modalRoot,
            {
                paddingTop,
                paddingBottom,
            },
        ]}>
                    <react_native_1.StatusBar barStyle="dark-content"/>

                    <react_native_1.View style={styles.headerContainer}>
                        <react_native_1.View style={styles.headerTopRow}>
                            <react_native_1.View style={styles.headerTitleRow}>
                                <react_native_1.View style={styles.iconCircle}>
                                    <vector_icons_1.FontAwesome5 name="network-wired" size={15} color="#6366F1"/>
                                </react_native_1.View>
                                <react_native_1.Text style={styles.headerTitle}>
                                    Monitor de Rede
                                </react_native_1.Text>
                                <react_native_1.View style={styles.counterBadge}>
                                    <react_native_1.Text style={styles.counterBadgeText}>
                                        {filteredLogs.length}
                                    </react_native_1.Text>
                                </react_native_1.View>
                            </react_native_1.View>

                            <react_native_1.TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                                <vector_icons_1.FontAwesome5 name="times" size={14} color="#475569"/>
                            </react_native_1.TouchableOpacity>
                        </react_native_1.View>

                        <react_native_1.View style={styles.searchWrapper}>
                            <react_native_1.View style={styles.searchBox}>
                                <vector_icons_1.MaterialCommunityIcons name="magnify" size={20} color="#6366F1"/>
                                <react_native_1.TextInput value={search} onChangeText={setSearch} placeholder="Filtrar por endpoint ou status..." placeholderTextColor="#94A3B8" style={styles.searchInput}/>
                                {search.length > 0 && (<react_native_1.TouchableOpacity onPress={() => setSearch("")}>
                                        <vector_icons_1.FontAwesome5 name="times-circle" size={15} color="#94A3B8"/>
                                    </react_native_1.TouchableOpacity>)}
                            </react_native_1.View>
                        </react_native_1.View>

                        <react_native_1.View style={styles.filterActionsRow}>
                            <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent} style={styles.filterScroll}>
                                {["TODOS", "ERROS", "GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => {
            const selected = filterMethod === method;
            return (<react_native_1.TouchableOpacity key={method} onPress={() => setFilterMethod(method)} style={[
                    styles.methodPill,
                    selected && styles.methodPillActive,
                ]}>
                                            <react_native_1.Text style={[
                    styles.methodPillText,
                    selected && styles.methodPillTextActive,
                ]}>
                                                {method}
                                            </react_native_1.Text>
                                        </react_native_1.TouchableOpacity>);
        })}
                            </react_native_1.ScrollView>

                            <react_native_1.TouchableOpacity onPress={networkLogger_1.clearNetworkLogs} style={styles.clearButton}>
                                <vector_icons_1.MaterialCommunityIcons name="trash-can-outline" size={15} color="#DC2626"/>
                                <react_native_1.Text style={styles.clearButtonText}>
                                    Limpar
                                </react_native_1.Text>
                            </react_native_1.TouchableOpacity>
                        </react_native_1.View>
                    </react_native_1.View>

                    <react_native_1.FlatList data={filteredLogs} keyExtractor={(item) => item.id} renderItem={({ item }) => <NetworkItemCard_1.default item={item}/>} contentContainerStyle={styles.listContent} style={styles.list} ListEmptyComponent={<react_native_1.View style={styles.emptyContainer}>
                                <react_native_1.View style={styles.emptyIconCircle}>
                                    <vector_icons_1.MaterialCommunityIcons name="wifi-arrow-up-down" size={38} color="#6366F1"/>
                                </react_native_1.View>
                                <react_native_1.Text style={styles.emptyTitle}>
                                    Nenhuma requisição encontrada
                                </react_native_1.Text>
                                <react_native_1.Text style={styles.emptyDescription}>
                                    As requisições feitas pelo aplicativo aparecerão aqui automaticamente.
                                </react_native_1.Text>
                            </react_native_1.View>}/>
                </react_native_1.View>
            </react_native_1.Modal>
        </>);
};
exports.NetworkInspector = NetworkInspector;
const styles = react_native_1.StyleSheet.create({
    floatingButtonContainer: {
        position: "absolute",
        bottom: 95,
        right: 16,
        zIndex: 99999,
    },
    floatingButton: {
        backgroundColor: "#1E293B",
        borderRadius: 28,
        paddingVertical: 9,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        borderWidth: 1,
        borderColor: "#334155",
    },
    floatingButtonText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    floatingBadge: {
        backgroundColor: "#EF4444",
        borderRadius: 10,
        paddingVertical: 2,
        paddingHorizontal: 7,
    },
    floatingBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    modalRoot: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    headerContainer: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderColor: "#E2E8F0",
    },
    headerTopRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#0F172A",
    },
    counterBadge: {
        backgroundColor: "#EEF2FF",
        borderRadius: 10,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },
    counterBadgeText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#4F46E5",
    },
    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    searchWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        width: "100%",
    },
    searchBox: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    searchInput: {
        flex: 1,
        height: 38,
        paddingHorizontal: 8,
        color: "#0F172A",
        fontSize: 13,
    },
    filterActionsRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    filterScroll: {
        flex: 1,
        marginRight: 10,
    },
    filterScrollContent: {
        gap: 8,
        alignItems: "center",
    },
    methodPill: {
        paddingVertical: 6,
        paddingHorizontal: 13,
        borderRadius: 16,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    methodPillActive: {
        backgroundColor: "#6366F1",
        borderColor: "#6366F1",
    },
    methodPillText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#475569",
    },
    methodPillTextActive: {
        color: "#FFFFFF",
    },
    clearButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FECACA",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    clearButtonText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#DC2626",
    },
    list: {
        width: "100%",
        flex: 1,
    },
    listContent: {
        padding: 14,
        paddingBottom: 24,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        gap: 12,
    },
    emptyIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#0F172A",
        textAlign: "center",
    },
    emptyDescription: {
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 18,
    },
});
exports.default = exports.NetworkInspector;
