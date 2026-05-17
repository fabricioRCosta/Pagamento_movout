import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { API_BASE_URL } from '../../api/config';

const History = ({ onNavigate }) => {
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const json = (await AsyncStorage.getItem('userData')) || (await AsyncStorage.getItem('user'));
            if (!json) return;

            const user = JSON.parse(json);
            if (!user || !user.email) {
                console.error("Histórico: email do usuário não encontrado no AsyncStorage");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/cliente/me/historico?email=${user.email}`);
            const data = await response.json();

            if (response.ok) {
                setHistoryItems(data);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.white} size={24} />
                </TouchableOpacity>
                <Text size="xxl" weight="bold" style={styles.headerTitle}>Histórico</Text>
                <Text size="sm" style={styles.headerSubtitle}>Seus fretes realizados</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : historyItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text size="display">📦</Text>
                        <Text size="md" color="textSecondary" style={{ marginTop: 12 }}>
                            Nenhum frete encontrado.
                        </Text>
                    </View>
                ) : (
                    historyItems.map((item) => (
                        <Card key={item.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.dateBadge}>
                                    <Calendar color={theme.colors.textSecondary} size={14} />
                                    <Text size="xs" color="textSecondary">{item.date}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    item.status === 'cancelado' && styles.statusCancelled,
                                ]}>
                                    <Text size="xs" weight="medium" style={[
                                        styles.statusText,
                                        item.status === 'cancelado' && styles.statusTextCancelled,
                                    ]}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={styles.locationContainer}>
                                <View style={styles.locationItem}>
                                    <View style={[styles.dot, styles.dotOrigin]} />
                                    <Text size="sm" color="text">{item.origin}</Text>
                                </View>
                                <View style={styles.line} />
                                <View style={styles.locationItem}>
                                    <View style={[styles.dot, styles.dotDest]} />
                                    <Text size="sm" color="text">{item.dest}</Text>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text size="sm" color="textSecondary">Motorista: {item.driver}</Text>
                                <Text size="md" weight="bold" color="primary">{item.price}</Text>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        padding: theme.spacing.lg,
        paddingTop: 50,
        paddingBottom: theme.spacing.xl,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: theme.borderRadius.xxl,
        borderBottomRightRadius: theme.borderRadius.xxl,
    },
    backButton: {
        width: 44, height: 44,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    headerTitle: { color: theme.colors.white },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)' },
    content: { padding: theme.spacing.lg },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    card: {
        padding: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.surfaceAlt,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.md,
    },
    statusBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.md,
    },
    statusCancelled: {
        backgroundColor: '#FEE2E2',
    },
    statusText: { color: '#065F46' },
    statusTextCancelled: { color: theme.colors.error },
    locationContainer: { marginBottom: theme.spacing.md },
    locationItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOrigin: { backgroundColor: theme.colors.success },
    dotDest: { backgroundColor: theme.colors.primary },
    line: {
        height: 20, width: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 4.5, marginVertical: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surfaceAlt,
    },
});

export default History;
