import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Card from '../../layouts/Components/Card';
import AppLayout from '../../layouts/Layouts/AppLayout';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import axios from 'axios';
import { API_BASE_URL } from '../../../api/config';
import { useAuth } from '../../context/AuthContext';

export default function Profile({ navigation }) {
  const { user } = useAuth();
  const [image, setImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [profileData, setProfileData] = useState({
    nome: user?.nome || 'Motorista',
    cpf: '...',
    total_fretes: 0,
    saldo_carteira: 0,
    data_inicio: '...',
    avaliacao: 4.8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id_motorista) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/motoristas/${user.id_motorista}/perfil`);
        setProfileData(response.data);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <AppLayout title="Meu Perfil">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meu Perfil" scrollable>
      <View style={styles.content}>
        {/* User Info */}
        <Card style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <Image
              source={{ uri: image }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profileData.nome}</Text>
            <Text style={styles.userSince}>Freteiro desde {profileData.data_inicio}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>⭐ {profileData.avaliacao.toFixed(1)}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsItem}>
            <Card style={styles.statsCard}>
              <Text style={styles.statsLabel}>FRETES</Text>
              <Text style={styles.statsValue}>{profileData.total_fretes}</Text>
              <Text style={styles.statsSub}>Realizados</Text>
            </Card>
          </View>
          <View style={styles.statsItem}>
            <Card style={styles.statsCard}>
              <Text style={styles.statsLabel}>STATUS</Text>
              <Text style={[styles.statsValue, { fontSize: 18, color: '#10B981' }]}>ATIVO</Text>
              <Text style={styles.statsSub}>Conta verificada</Text>
            </Card>
          </View>
        </View>

        {/* Earnings Card */}
        <Card style={styles.earningsCard}>
          <Text style={styles.statsLabel}>SALDO NA CARTEIRA</Text>
          <Text style={styles.earningsValue}>{formatCurrency(profileData.saldo_carteira)}</Text>
          <View style={styles.earningsFooter}>
            <Text style={styles.statsSub}>Saldo disponível para saque</Text>
            <TouchableOpacity>
              <Text style={styles.withdrawLink}>Sacar ➜</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Menu Options */}
        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>⚙️</Text>
            </View>
            <Text style={styles.menuText}>Configurações da Conta</Text>
            <Text style={styles.menuArrow}>➜</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>❓</Text>
            </View>
            <Text style={styles.menuText}>Central de Ajuda</Text>
            <Text style={styles.menuArrow}>➜</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={() => navigation.navigate('Login')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#fad0d0ff' }]}>
              <Text style={styles.menuIcon}>🚪</Text>
            </View>
            <Text style={[styles.menuText, { color: theme.colors.error }]}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: theme.spacing.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatarContainer: { marginRight: theme.spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.black,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  editBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.black
  },
  userSince: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.black,
    marginRight: 4,
  },
  reviewsCount: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  statsItem: {
    width: '48%',
  },
  statsCard: {
    padding: theme.spacing.md,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  statsValue: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.black
  },
  statsSub: {
    fontSize: 10,
    color: theme.colors.textSecondary
  },
  earningsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  },
  earningsValue: {
    fontSize: theme.typography.fontSizes.display,
    fontWeight: theme.typography.fontWeights.extraBold,
    color: theme.colors.black,
    marginVertical: 4
  },
  earningsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  withdrawLink: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSizes.sm,
  },
  menuList: {
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  },
  menuArrow: {
    fontSize: 14,
    color: theme.colors.border,
    fontWeight: 'bold',
  },
});
