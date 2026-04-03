import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';
import { Card } from '../ui/Card';

const ForgotPassword = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = () => {
        if (!email) return;
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <TouchableOpacity onPress={() => onNavigate('login')} style={styles.backButton}>
                        <ArrowLeft color={theme.colors.white} size={24} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Logo size="lg" />
                        <Text variant="subtitle" color="logoDark" style={styles.subtitle}>
                            recuperar senha
                        </Text>
                    </View>

                    <Card style={styles.card}>
                        {!sent ? (
                            <>
                                <Text style={styles.description}>
                                    Digite seu email cadastrado para receber as instruções de recuperação de senha.
                                </Text>

                                <Input
                                    label="Email"
                                    placeholder="usuario@exemplo.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    leftIcon={<Text size="lg">✉️</Text>}
                                />

                                <Button
                                    title="Enviar"
                                    onPress={handleSubmit}
                                    loading={loading}
                                    style={{ ...styles.button, backgroundColor: 'black' }}
                                    variant="primary"
                                />
                            </>
                        ) : (
                            <View style={styles.successContainer}>
                                <Text size="xl" style={styles.successIcon}>✅</Text>
                                <Text weight="bold" size="lg" style={styles.successTitle}>Email Enviado!</Text>
                                <Text style={styles.successText}>
                                    Verifique sua caixa de entrada para redefinir sua senha.
                                </Text>
                                <Button
                                    title="Voltar ao Login"
                                    onPress={() => onNavigate('login')}
                                    variant="outline"
                                    style={{ ...styles.button, borderColor: 'black' }}
                                    textStyle={{ color: 'black' }}
                                />
                            </View>
                        )}
                    </Card>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.orangeBackground,
    },
    keyboardView: { flex: 1 },
    scrollContent: {
        padding: 24,
        paddingTop: 48,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    header: {
        alignItems: 'center',
        marginBottom: 32
    },
    subtitle: {
        marginTop: 8,
        letterSpacing: 0.5,
    },
    card: {
        paddingVertical: 32,
    },
    description: {
        marginBottom: 24,
        color: theme.colors.textSecondary,
        textAlign: 'center'
    },
    button: {
        marginTop: 16,
    },
    successContainer: {
        alignItems: 'center',
        padding: 16
    },
    successIcon: {
        marginBottom: 16,
        fontSize: 48
    },
    successTitle: {
        marginBottom: 8,
        color: theme.colors.textPrimary
    },
    successText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 24
    }
});

export default ForgotPassword;
