import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, StatusBar } from 'react-native';
import { Logo } from '../ui/Logo';
import { Text } from '../ui/Text';
import { theme } from '../../theme';

const Splash = ({ onNavigate }) => {
    const fadeAnim = new Animated.Value(0);
    console.log('--- [SPLASH] Renderizando Splash ---');

    useEffect(() => {
        console.log('--- [SPLASH] Iniciando animação e timer de 3s... ---');
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            console.log('--- [SPLASH] Timer de 3s finalizado. Navegando para LOGIN... ---');
            if (onNavigate) {
                onNavigate('login');
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [onNavigate]);


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Logo size="lg" />
                <Text variant="subtitle" size="xl" weight="medium" align="center" color="logoDark" style={styles.tagline}>
                    seu app de fretes
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.orangeBackground,
    },
    content: {
        alignItems: 'center',
    },
    tagline: {
        marginTop: 16,
        letterSpacing: 0.5,
        color: theme.colors.logoDark,
    },
});

export default Splash;

