import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import FreightCard from '../../layouts/Components/FreightCard';
import AppLayout from '../../layouts/Layouts/AppLayout';
import { theme } from '../../theme';
import axios from 'axios';
import { API_BASE_URL } from '../../../api/config';

export default function Home({ navigation }) {
  const [freights, setFreights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFreights = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fretes/`);
      // Filtra apenas fretes com status "aberto"
      const abertos = response.data.filter(f => f.status === 'aberto');
      setFreights(abertos);
    } catch (error) {
      console.error('Erro ao buscar fretes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreights();
    const interval = setInterval(fetchFreights, 5000);
    return () => clearInterval(interval);
  }, [fetchFreights]);

  const getTagsForFrete = (frete) => {
    const tags = [];
    if (frete.prioridade === 'urgent') tags.push('Urgente');
    if (frete.fragil) tags.push('Frágil');
    if (frete.objeto_ia) tags.push('IA Confirmou');
    if (tags.length === 0) tags.push('Novo');
    return tags;
  };

  return (
    <AppLayout title="MOVOUT" scrollable>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>FRETES DISPONÍVEIS</Text>
            <Text style={styles.summaryValueBig}>{freights.length}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>STATUS</Text>
            <Text style={[styles.summaryValueMedium, { color: '#10B981' }]}>Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fretes Disponíveis</Text>
        <Text style={styles.sectionSubtitle}>
          {loading ? 'Carregando...' : `${freights.length} solicitação(ões) aguardando`}
        </Text>
      </View>

      {loading && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.textSecondary }}>Buscando fretes...</Text>
        </View>
      )}

      {!loading && freights.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 48 }}>📦</Text>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 12 }}>
            Nenhum frete disponível no momento
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
            Atualizando automaticamente...
          </Text>
        </View>
      )}

      {freights.map((frete) => (
        <FreightCard
          key={frete.id}
          title={frete.descricao || 'Frete sem descrição'}
          weight={String(frete.peso_estimado)}
          distance="—"
          price="—"
          origin={frete.origem || 'Não informado'}
          destination={frete.destino || 'Não informado'}
          tags={getTagsForFrete(frete)}
          onPress={() => navigation.navigate('Negotiation', { freteId: frete.id })}
        />
      ))}

    </AppLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#ccd1d8ff',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: 4,
  },
  summaryValueBig: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.extraBold,
  },
  summaryValueMedium: {
    color: theme.colors.black,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.black,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.black,
    opacity: 0.8,
  },
});
