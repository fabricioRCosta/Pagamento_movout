import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Truck, Home as HomeIcon, User, History as HistoryIcon, Search } from 'lucide-react-native';
import { theme } from '../../theme';
import { Text } from '../ui/Text';
import { Logo } from '../ui/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ onNavigate }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    const initialRegion = {
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Logo size="sm" />
                    <View style={styles.avatar} />
                </View>

                <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
                    <Search color={theme.colors.textSecondary} size={20} />
                    <Text color="textSecondary" style={styles.searchText}>Para onde vamos?</Text>
                </TouchableOpacity>
            </View>

            {/* Map Area */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={initialRegion}
                    region={location ? {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                    } : initialRegion}
                    showsUserLocation={true}
                />

                <TouchableOpacity
                    style={styles.requestButton}
                    onPress={() => onNavigate('request')}
                    activeOpacity={0.9}
                >
                    <Truck color="#fff" size={24} />
                    <Text weight="bold" style={styles.requestText}>Solicitar Frete</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItemActive}>
                    <HomeIcon color={theme.colors.primary} size={24} />
                    <Text size="xs" color="primary" weight="bold" style={styles.navLabel}>Início</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('history')}>
                    <HistoryIcon color={theme.colors.textSecondary} size={24} />
                    <Text size="xs" color="textSecondary" style={styles.navLabel}>Histórico</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('profile')}>
                    <User color={theme.colors.textSecondary} size={24} />
                    <Text size="xs" color="textSecondary" style={styles.navLabel}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primary },
    header: {
        padding: theme.spacing.lg,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        backgroundColor: theme.colors.primary,
        paddingBottom: theme.spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 20,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.xl,
        ...theme.shadows.sm,
    },
    searchText: { marginLeft: 12 },
    mapContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: theme.borderRadius.xxl,
        borderTopRightRadius: theme.borderRadius.xxl,
        backgroundColor: theme.colors.white,
        marginTop: -theme.spacing.md,
    },
    map: { width: '100%', height: '100%' },
    requestButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: theme.colors.accent,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.round,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...theme.shadows.lg,
    },
    requestText: { color: theme.colors.white, marginLeft: 8 },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderTopWidth: 0,
        ...theme.shadows.lg,
    },
    navItem: { alignItems: 'center', padding: 8 },
    navItemActive: {
        alignItems: 'center',
        padding: 8,
        backgroundColor: theme.colors.primaryLight + '40',
        borderRadius: theme.borderRadius.lg,
    },
    navLabel: { marginTop: 4 },
});

export default Home;
