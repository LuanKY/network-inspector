import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    clearNetworkLogs,
    getNetworkLogs,
    initNetworkLogging,
    NetworkRequestLog,
    subscribeNetworkLogs,
} from "../core/networkLogger";
import NetworkItemCard from "./NetworkItemCard";

export * from "../core/networkLogger";
export * from "./NetworkItemCard";

export const NetworkInspector: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [logs, setLogs] = useState<NetworkRequestLog[]>([]);
    const [search, setSearch] = useState("");
    const [filterMethod, setFilterMethod] = useState<string>("TODOS");

    useEffect(() => {
        let timer: any = null;
        const unsubscribe = subscribeNetworkLogs(() => {
            if (timer) {
                return;
            }
            timer = setTimeout(() => {
                timer = null;
                setLogs(getNetworkLogs());
            }, 80);
        });
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (visible) {
            setLogs(getNetworkLogs());
        }
    }, [visible]);

    const filteredLogs = useMemo(() => {
        return logs.filter((item) => {
            const matchesSearch =
                !search ||
                item.url.toLowerCase().includes(search.toLowerCase()) ||
                item.endpoint.toLowerCase().includes(search.toLowerCase()) ||
                (item.status && String(item.status).includes(search));

            const matchesMethod =
                filterMethod === "TODOS" ||
                (filterMethod === "ERROS" && (item.state === "error" || (item.status && item.status >= 400))) ||
                (item.method && item.method.toUpperCase() === filterMethod);

            return matchesSearch && matchesMethod;
        });
    }, [logs, search, filterMethod]);

    const paddingTop = Math.max(insets.top, 24);
    const paddingBottom = Math.max(insets.bottom, 12);

    return (
        <>
            <View style={styles.floatingButtonContainer} pointerEvents="box-none">
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setVisible(true)}
                    style={styles.floatingButton}
                >
                    <FontAwesome5 name="network-wired" size={14} color="#FFFFFF" />
                    <Text style={styles.floatingButtonText}>
                        Rede
                    </Text>
                    {logs.length > 0 && (
                        <View style={styles.floatingBadge}>
                            <Text style={styles.floatingBadgeText}>
                                {logs.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                visible={visible}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View
                    style={[
                        styles.modalRoot,
                        {
                            paddingTop,
                            paddingBottom,
                        },
                    ]}
                >
                    <StatusBar barStyle="dark-content" />

                    <View style={styles.headerContainer}>
                        <View style={styles.headerTopRow}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.iconCircle}>
                                    <FontAwesome5 name="network-wired" size={15} color="#6366F1" />
                                </View>
                                <Text style={styles.headerTitle}>
                                    Monitor de Rede
                                </Text>
                                <View style={styles.counterBadge}>
                                    <Text style={styles.counterBadgeText}>
                                        {filteredLogs.length}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setVisible(false)}
                                style={styles.closeButton}
                            >
                                <FontAwesome5 name="times" size={14} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchWrapper}>
                            <View style={styles.searchBox}>
                                <MaterialCommunityIcons name="magnify" size={20} color="#6366F1" />
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Filtrar por endpoint ou status..."
                                    placeholderTextColor="#94A3B8"
                                    style={styles.searchInput}
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch("")}>
                                        <FontAwesome5 name="times-circle" size={15} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={styles.filterActionsRow}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterScrollContent}
                                style={styles.filterScroll}
                            >
                                {["TODOS", "ERROS", "GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => {
                                    const selected = filterMethod === method;
                                    return (
                                        <TouchableOpacity
                                            key={method}
                                            onPress={() => setFilterMethod(method)}
                                            style={[
                                                styles.methodPill,
                                                selected && styles.methodPillActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.methodPillText,
                                                    selected && styles.methodPillTextActive,
                                                ]}
                                            >
                                                {method}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={clearNetworkLogs}
                                style={styles.clearButton}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={15} color="#DC2626" />
                                <Text style={styles.clearButtonText}>
                                    Limpar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <FlatList
                        data={filteredLogs}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <NetworkItemCard item={item} />}
                        contentContainerStyle={styles.listContent}
                        style={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="wifi-arrow-up-down" size={38} color="#6366F1" />
                                </View>
                                <Text style={styles.emptyTitle}>
                                    Nenhuma requisição encontrada
                                </Text>
                                <Text style={styles.emptyDescription}>
                                    As requisições feitas pelo aplicativo aparecerão aqui automaticamente.
                                </Text>
                            </View>
                        }
                    />
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
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

export default NetworkInspector;
