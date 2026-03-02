import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { theme } from '../../theme';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';
import { Card } from '../ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../api/config';


const Login = ({ onNavigate, onLogin }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !senha) {
            setErro('Por favor, preencha email e senha.');
            return;
        }

        setErro('');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, senha: senha }),
            });

            const data = await response.json();
            if (response.ok) {
                // Sucesso! Salva os dados no AsyncStorage para manter o usuário logado
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(data.usuario));

                // Navega para a Home
                onLogin(data.usuario);
            } else {
                // Falhou (ex: E-mail ou senha incorretos)
                setErro(data.detail || 'Erro ao fazer login.');
            }
        } catch (error) {
            setErro('Não foi possível conectar ao servidor.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <Logo size="lg" />
                        <Text variant="subtitle" align="center" color="logoDark" style={styles.subtitle}>
                            seu app de fretes
                        </Text>
                    </View>

                    <Card style={styles.card}>
                        <Input
                            label="Email"
                            placeholder="usuario@exemplo.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            leftIcon={<Text size="lg">✉️</Text>}
                        />

                        <Input
                            label="Senha"
                            placeholder="••••••••"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                            leftIcon={<Text size="lg">🔒</Text>}
                        />

                        {erro ? (
                            <Text color="error" size="sm" style={styles.error}>
                                {erro}
                            </Text>
                        ) : null}

                        <Button
                            title="Entrar"
                            onPress={handleSubmit}
                            loading={loading}
                            style={{ ...styles.loginButton, backgroundColor: 'black' }}
                            variant="primary"
                        />

                        <Button
                            title="Criar Conta"
                            onPress={() => onNavigate('register')}
                            variant="ghost"
                            style={{ ...styles.registerButton, elevation: 0, shadowOpacity: 0 }}
                            textStyle={{ color: 'black' }}
                        />

                        <Button
                            title="Esqueceu a senha?"
                            onPress={() => onNavigate('forgot')}
                            variant="ghost"
                            size="sm"
                            style={{ ...styles.forgotButton, elevation: 0, shadowOpacity: 0 }}
                            textStyle={{ color: 'black' }}
                        />
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
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
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
        marginBottom: 24,
        paddingVertical: 32,
        alignItems: 'center',
    },
    error: {
        marginBottom: 16,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 8,
        marginBottom: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 10
    },
    footerText: {
        marginBottom: 12,
    },
    registerButton: {
        borderColor: theme.colors.logoDark,
        paddingHorizontal: 32,
    }
});

export default Login;
