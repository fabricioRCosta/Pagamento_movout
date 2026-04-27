import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AuthLayout from '../../layouts/Layouts/AuthLayout';
import Button from '../../layouts/Components/button';
import Input from '../../layouts/Components/Input';
import Logo from '../../layouts/Components/Logo';
import Text from '../../layouts/Components/Text';
import Card from '../../layouts/Components/Card';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function Login({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // BYPASS TEMPORÁRIO PARA DESENVOLVIMENTO
    setLoading(true);
    try {
      // Simula uma resposta bem-sucedida com dados falsos
      await login({
        id_pessoa: 1,
        nome: "Motorista Teste",
        email: email || "teste@teste.com",
        tipo: "motorista"
      });
      navigation.navigate('Home');
    } catch (error) {
      setErro('Erro no bypass.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size="lg" />
        </View>
        <Card style={styles.card}>
          <Input
            label="Email"
            placeholder="motorista@exemplo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Text size="lg"></Text>}
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            leftIcon={<Text size="lg"></Text>}
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
            variant="primary"
          />

          <Button
            title="Criar Conta"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
            disabled={loading}
          />

          <Button
            title="Esqueceu a senha?"
            onPress={() => navigation.navigate('ForgotPassword')}
            variant="ghost"
            size="sm"
            disabled={loading}
            style={styles.forgotButton}
            textStyle={styles.forgotText}
          />
        </Card>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  appName: {
    marginTop: theme.spacing.sm,
    color: theme.colors.white,
    letterSpacing: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    width: '85%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  error: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  forgotButton: {
    elevation: 0,
    shadowOpacity: 0,
  },
  forgotText: {
    textDecorationLine: 'underline',
  },
});
