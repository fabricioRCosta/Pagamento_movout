import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import AuthLayout from '../../layouts/Layouts/AuthLayout';
import MyButton from '../../layouts/Components/button';
import MyInput from '../../layouts/Components/Input';
import logoImg from '../../../../assets/logo.png';
import { loginUser } from '../../../../requiscoes';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email, senha);
      if (response.status === 'sucesso' && response.usuario) {
        login(response.usuario);
        navigation.navigate('Home');
      } else {
        throw new Error('Falha no login');
      }
    } catch (error) {
      Alert.alert('Erro', 'Login ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={logoImg}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>MOVOUT</Text>
          <Text style={styles.subtitle}>seu app de fretes</Text>
        </View>

        <View style={styles.card}>
          <MyInput
            label="Email"
            placeholder="usuario@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Text style={{ fontSize: 18 }}>✉️</Text>}
          />
          <MyInput
            label="Senha"
            placeholder="••••••••"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            leftIcon={<Text style={{ fontSize: 18 }}>🔒</Text>}
          />

          <MyButton
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={loading}
          />
          <MyButton
            title="Criar Conta"
            type="secondary"
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    width: '100%'
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.display,
    fontWeight: theme.typography.fontWeights.extraBold,
    color: theme.colors.black
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.black,
    opacity: 0.7
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '85%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  forgotContainer: {
    marginTop: theme.spacing.md,
  },
  forgot: {
    color: theme.colors.black,
    textDecorationLine: 'underline',
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
