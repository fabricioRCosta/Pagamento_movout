import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';
import { Card } from '../ui/Card';
import { API_BASE_URL } from '../../api/config';


const Register = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErro('');
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.nome || !formData.email || !formData.telefone || !formData.cpf || !formData.senha || !formData.confirmarSenha) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    if (formData.cpf.length < 11) {
      setErro('O CPF deve ser válido');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          cpf: formData.cpf,
          telefone: formData.telefone,
          tipo: 'cliente'
        }),
      });


      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        // Sucesso - Redirecionar para login ou login automático
        alert('Cadastro realizado com sucesso!');
        onNavigate('login');
      } else {
        setErro(data.detail || 'Erro ao realizar cadastro');
        setLoading(false);
      }
    } catch (e) {
      setErro('Erro de conexão com o servidor');
      console.error(e);
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

          <TouchableOpacity onPress={() => onNavigate('login')} style={styles.backButton}>
            <ArrowLeft color={theme.colors.white} size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Logo size="lg" />
            <Text variant="subtitle" color="logoDark" style={styles.subtitle}>
              crie sua conta
            </Text>
          </View>

          <Card style={styles.card}>
            <Input
              label="Nome Completo"
              placeholder="João Pedro da Silva"
              value={formData.nome}
              onChangeText={(t) => handleChange('nome', t)}
            />

            <Input
              label="Email"
              placeholder="joao.silva@exemplo.com"
              value={formData.email}
              onChangeText={(t) => handleChange('email', t)}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChangeText={(t) => handleChange('cpf', t)}
              keyboardType="numeric"
            />

            <Input
              label="Telefone"
              placeholder="(65) 98765-4321"
              value={formData.telefone}
              onChangeText={(t) => handleChange('telefone', t)}
              keyboardType="phone-pad"
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={formData.senha}
              onChangeText={(t) => handleChange('senha', t)}
              secureTextEntry
            />

            <Input
              label="Confirmar senha"
              placeholder="••••••••"
              value={formData.confirmarSenha}
              onChangeText={(t) => handleChange('confirmarSenha', t)}
              secureTextEntry
            />

            {erro ? <Text color="error" size="sm" style={styles.error}>{erro}</Text> : null}

            <Button
              title="Cadastrar-se"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              style={{ ...styles.button, backgroundColor: 'black' }}
            />
          </Card>

          <TouchableOpacity onPress={() => onNavigate('login')} style={styles.cancelButton}>
            <Text color="black" weight="bold" style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

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
  scrollContent: { padding: 24, paddingTop: 48, paddingBottom: 40 },
  backButton: {
    width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  header: { alignItems: 'center', marginBottom: 24 },
  subtitle: { marginTop: 8 },
  card: { marginBottom: 24, paddingVertical: 24 },
  error: {
    marginBottom: 16, textAlign: 'center'
  },
  button: {
    marginTop: 8,
  },
  cancelButton: {
    padding: 16, borderRadius: 16, alignItems: 'center'
  },
  cancelText: { textDecorationLine: 'underline' }
});

export default Register;
