import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, CreditCard, Bell, Shield, LogOut, ChevronRight, Edit2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ onNavigate, onLogout }) => {
    const [userData, setUserData] = useState({ nome: 'Carregando...', email: '', cpf: '', telefone: '' });

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const json = await AsyncStorage.getItem('userData');
            if (json) {
                setUserData(JSON.parse(json));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const menuItems = [
        { icon: User, label: 'Editar Perfil', action: () => { } },
        { icon: CreditCard, label: 'Pagamentos', action: () => { } },
        { icon: Bell, label: 'Notificações', action: () => { } },
        { icon: Shield, label: 'Segurança e Privacidade', action: () => { } },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#F4A259', '#D97706']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meu Perfil</Text>
                    <TouchableOpacity style={styles.backButton}>
                        {/* Placeholder balance */}
                    </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{(userData.nome || userData.name || 'U').charAt(0).toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <Edit2 color="white" size={12} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{userData.nome || userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF</Text>
                        <Text style={styles.infoValue}>{userData.cpf || 'Não informado'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Telefone</Text>
                        <Text style={styles.infoValue}>{userData.telefone || 'Não informado'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configurações</Text>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity key={index} style={styles.menuItem}>
                                <View style={styles.menuIconBox}>
                                    <Icon color="#F4A259" size={20} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <ChevronRight color="#9CA3AF" size={20} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <LogOut color="#EF4444" size={20} />
                    <Text style={styles.logoutText}>Sair da conta</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Versão 1.0.0</Text>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { padding: 20, paddingTop: 50, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }, // Invisible placeholder for right alignment
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    profileInfo: { alignItems: 'center' },
    avatarContainer: { marginBottom: 12, position: 'relative' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
    avatarText: { fontSize: 32, color: '#F4A259', fontWeight: 'bold' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F4A259', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'white' },

    userName: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

    content: { padding: 20, paddingTop: 24 },
    section: { backgroundColor: 'white', borderRadius: 16, padding: 8, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#6B7280', margin: 12, marginBottom: 8 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
    infoLabel: { fontSize: 16, color: '#6B7280' },
    infoValue: { fontSize: 16, color: '#1F2937', fontWeight: '500' },

    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
    menuIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    menuLabel: { flex: 1, fontSize: 16, color: '#1F2937' },

    logoutButton: { backgroundColor: 'black', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 },
    logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    versionText: { textAlign: 'center', marginTop: 24, color: '#9CA3AF' }
});

export default Profile;