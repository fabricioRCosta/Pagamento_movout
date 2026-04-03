import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, DollarSign, Star, CheckCircle, MessageCircle } from 'lucide-react-native';
import { API_BASE_URL } from '../../api/config';

const Negotiation = ({ onNavigate, freightId }) => {
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [counterOffer, setCounterOffer] = useState('0,00');

    console.log('[Negotiation] Freight ID:', freightId);

    useEffect(() => {
        let intervalId;

        const loadNegotiation = async () => {
            if (!freightId) {
                setErrorMsg('ID do frete não informado.');
                setLoading(false);
                return;
            }

            try {
                // Poll novo endpoint de propostas do frete
                const response = await fetch(`${API_BASE_URL}/fretes/${freightId}/propostas`);
                const data = await response.json();

                if (response.ok && data && data.length > 0) {
                    // Pega a proposta mais recente / primeira proposta
                    const proposal = data[data.length - 1];

                    const formattedPrice = `R$ ${proposal.valor.toFixed(2)}`.replace('.', ',');
                    const suggestedVal = proposal.valor * 0.9;
                    const formattedSuggested = `R$ ${suggestedVal.toFixed(2)}`.replace('.', ',');

                    setDriver({
                        name: proposal.nome_motorista,
                        rating: proposal.rating || 5.0,
                        trips: 12,
                        vehicle: "Veículo", // Info padrao ja q n vem na proposta simples
                        plate: "ABC-1234",
                        photo: "https://randomuser.me/api/portraits/men/32.jpg",
                        price: formattedPrice,
                        rawPrice: proposal.valor,
                        rawId: proposal.motorista_id,
                        time: proposal.tempo_estimado,
                        suggestedPrice: formattedSuggested
                    });

                    setCounterOffer(suggestedVal.toFixed(2).replace('.', ','));
                    setLoading(false);
                    setErrorMsg('');

                    // Se encontrou proposta, para de buscar
                    if (intervalId) clearInterval(intervalId);
                } else {
                    setErrorMsg('Aguardando proposta do motorista...');
                    setLoading(false);
                }
            } catch (error) {
                console.error("Erro ao carregar negociacao:", error);
                if (!driver) {
                    setErrorMsg('Buscando propostas...');
                }
            }
        };

        // Roda a primeira vez logo de cara
        loadNegotiation();

        // Configura o Poll a cada 3 segundos
        intervalId = setInterval(loadNegotiation, 3000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [freightId]);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#F4A259', '#D97706']} style={styles.header}>
                <TouchableOpacity onPress={() => onNavigate('request')} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Proposta Disponível</Text>
                <Text style={styles.headerSubtitle}>Motorista encontrou seu pedido</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>

                {loading ? (
                    <ActivityIndicator size="large" color="#F4A259" style={{ marginTop: 40 }} />
                ) : errorMsg ? (
                    <Text style={{ textAlign: 'center', marginTop: 40, color: '#DC2626', fontSize: 16 }}>{errorMsg}</Text>
                ) : driver && (
                    <>
                        {/* Driver Card */}
                        <View style={styles.card}>
                            <View style={styles.driverHeader}>
                                <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
                                <View style={styles.driverInfo}>
                                    <Text style={styles.driverName}>{driver.name}</Text>
                                    <View style={styles.ratingRow}>
                                        <Star color="#F59E0B" size={16} fill="#F59E0B" />
                                        <Text style={styles.ratingText}>{driver.rating} ({driver.trips} viagens)</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehicleText}>{driver.vehicle} • {driver.plate}</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.proposalDetails}>
                                <View style={styles.proposalItem}>
                                    <DollarSign color="#10B981" size={24} />
                                    <View>
                                        <Text style={styles.proposalLabel}>Preço Oferecido</Text>
                                        <Text style={styles.proposalValue}>{driver.price}</Text>
                                    </View>
                                </View>

                                <View style={styles.proposalItem}>
                                    <Clock color="#3B82F6" size={24} />
                                    <View>
                                        <Text style={styles.proposalLabel}>Tempo Estimado</Text>
                                        <Text style={styles.proposalValue}>{driver.time}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.suggestedBox}>
                                <Text style={styles.suggestedLabel}>Valor sugerido pelo App:</Text>
                                <Text style={styles.suggestedValue}>{driver.suggestedPrice}</Text>
                            </View>
                        </View>

                        {/* Counter Offer Section */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Contraproposta</Text>
                            <Text style={styles.description}>
                                O valor sugerido pelo motorista é {driver.price}. Você pode aceitar ou sugerir um novo valor.
                            </Text>

                            <View style={styles.counterInputContainer}>
                                <Text style={styles.currencyPrefix}>R$</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={{ color: '#374151' }}>Valor da sua oferta:</Text>
                                    <Text style={styles.inputValue}>{counterOffer}</Text>
                                    {/* Simplified for demo - in real app would be TextInput */}
                                </View>
                                <View style={styles.counterButtons}>
                                    <TouchableOpacity onPress={() => setCounterOffer(prev => (parseFloat(prev.replace(',', '.')) - 5).toFixed(2).replace('.', ','))} style={styles.counterBtn}>
                                        <Text style={styles.counterBtnText}>-5</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setCounterOffer(prev => (parseFloat(prev.replace(',', '.')) + 5).toFixed(2).replace('.', ','))} style={styles.counterBtn}>
                                        <Text style={styles.counterBtnText}>+5</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                )}

            </ScrollView>

            {/* Action Buttons */}
            {driver && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={async () => {
                            try {
                                // make API call to update status on server (must use POST)
                                const url = `${API_BASE_URL}/fretes/${freightId}/aceitar-proposta?motorista_id=${driver?.rawId || driver?.id || 0}`;
                                console.log('calling accept endpoint', url);
                                const resp = await fetch(url, { method: 'POST' });
                                if (!resp.ok) {
                                    throw new Error('erro ao chamar backend ' + resp.status);
                                }
                                // navigate to accepted view regardless (backend should notify via websocket)
                                onNavigate('accepted', { freightId });
                            } catch (e) {
                                console.error('Falha ao aceitar proposta no servidor', e);
                                Alert.alert('Erro', 'Não foi possível aceitar a proposta. Tente novamente.');
                            }
                        }}
                    >
                        <CheckCircle color="#fff" size={24} />
                        <Text style={styles.acceptButtonText}>Aceitar Proposta</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E6E9ED' },
    header: { padding: 20, paddingTop: 50, paddingBottom: 32 },
    backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

    content: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },

    driverHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    driverPhoto: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E5E7EB' },
    driverInfo: { flex: 1 },
    driverName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { color: '#6B7280', fontSize: 14 },

    vehicleInfo: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, alignItems: 'center' },
    vehicleText: { color: '#4B5563', fontWeight: '500' },

    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },

    proposalDetails: { flexDirection: 'row', justifyContent: 'space-around' },
    proposalItem: { alignItems: 'center', gap: 8 },
    proposalLabel: { fontSize: 12, color: '#6B7280' },
    proposalValue: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },

    suggestedBox: { marginTop: 16, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    suggestedLabel: { color: '#1E40AF', fontSize: 14 },
    suggestedValue: { color: '#1E40AF', fontWeight: 'bold', fontSize: 16 },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
    description: { color: '#6B7280', lineHeight: 20, marginBottom: 16 },

    counterInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    currencyPrefix: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginRight: 8 },
    inputWrapper: { flex: 1 },
    inputValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    counterButtons: { flexDirection: 'row', gap: 8 },
    counterBtn: { backgroundColor: 'black', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    counterBtnText: { color: 'white', fontWeight: 'bold' },

    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', flexDirection: 'row', gap: 12 },
    actionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12 },
    chatButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB' },
    chatButtonText: { color: '#4B5563', fontWeight: '600' },
    acceptButton: { backgroundColor: 'black', shadowColor: 'black', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    acceptButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default Negotiation;
