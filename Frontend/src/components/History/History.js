import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Calendar, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { API_BASE_URL } from '../../api/config';

const History = ({ onNavigate }) => {
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const json = (await AsyncStorage.getItem('user')) || (await AsyncStorage.getItem('userData'));
            if (!json) return;

            const user = JSON.parse(json);

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
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Histórico</Text>
                <Text style={styles.headerSubtitle}>Seus fretes realizados</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : historyItems.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>Nenhum frete encontrado.</Text>
                ) : (
                    historyItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.dateBadge}>
                                    <Calendar color="#6B7280" size={14} />
                                    <Text style={styles.dateText}>{item.date}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={styles.locationContainer}>
                                <View style={styles.locationItem}>
                                    <View style={[styles.dot, styles.dotOrigin]} />
                                    <Text style={styles.locationText}>{item.origin}</Text>
                                </View>
                                <View style={styles.line} />
                                <View style={styles.locationItem}>
                                    <View style={[styles.dot, styles.dotDest]} />
                                    <Text style={styles.locationText}>{item.dest}</Text>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.driverText}>Motorista: {item.driver}</Text>
                                <Text style={styles.priceText}>{item.price}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E6E9ED' },
    header: { padding: 20, paddingTop: 50, paddingBottom: 32, backgroundColor: theme.colors.orangeBackground },
    backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

    content: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    dateText: { fontSize: 12, color: '#4B5563' },
    statusBadge: { backgroundColor: '#DEF7EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, color: '#03543F', fontWeight: '600' },

    locationContainer: { marginBottom: 16 },
    locationItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    dotOrigin: { backgroundColor: '#10B981' },
    dotDest: { backgroundColor: theme.colors.primary },
    line: { height: 20, width: 1, backgroundColor: '#E5E7EB', marginLeft: 4.5, marginVertical: 2 },
    locationText: { color: '#1F2937', fontSize: 14 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    driverText: { color: '#6B7280', fontSize: 14 },
    priceText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 }
});

export default History;
