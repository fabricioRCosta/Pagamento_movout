import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import AuthLayout from '../../layouts/Layouts/AuthLayout';
import MyButton from '../../layouts/Components/button';
import MyInput from '../../layouts/Components/Input';
import Seletor from '../../layouts/Components/Seletor';
import logoImg from '../../../../assets/logo.png';
import { registerUser } from '../../../../requiscoes';
import { theme } from '../../theme';

export default function Register({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [cpf, setCpf] = useState('');
  const [veiculo, setVeiculo] = useState('Carro');
  const [marca, setMarca] = useState('');
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha || !cpf || !marca || !placa) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmacao) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nome,
        email,
        senha,
        cpf,
        veiculo,
        marca,
        placa,
        tipo: 'motorista'
      };

      await registerUser(userData);
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível realizar o cadastro. Tente novamente.');
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
          <Text style={styles.subtitle}>crie sua conta</Text>
        </View>

        <View style={styles.card}>
          <MyInput
            label="Nome Completo"
            placeholder="Ex: João Silva"
            value={nome}
            onChangeText={setNome}
          />
          <MyInput
            label="Email"
            placeholder="exemplo@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <MyInput
                label="Senha"
                placeholder="••••"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </View>
            <View style={{ flex: 1 }}>
              <MyInput
                label="Confirmar"
                placeholder="••••"
                secureTextEntry
                value={confirmacao}
                onChangeText={setConfirmacao}
              />
            </View>
          </View>

          <MyInput
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="numeric"
            value={cpf}
            onChangeText={setCpf}
          />

          <Seletor
            titulo="Qual veículo você possui?"
            opcoes={['Carro', 'Caminhonete', 'Caminhão']}
            valorSelecionado={veiculo}
            aoSelecionar={setVeiculo}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <MyInput
                label="Marca"
                placeholder="Ex: Ford"
                value={marca}
                onChangeText={setMarca}
              />
            </View>
            <View style={{ flex: 1 }}>
              <MyInput
                label="Placa"
                placeholder="ABC1D23"
                value={placa}
                onChangeText={setPlaca}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <MyButton
            title={loading ? "Cadastrando..." : "Finalizar Cadastro"}
            onPress={handleRegister}
            disabled={loading}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backContainer}
          >
            <Text style={styles.backText}>Voltar para o Login</Text>
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
    paddingVertical: theme.spacing.xl,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.extraBold,
    color: theme.colors.black
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.black,
    opacity: 0.7
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 450,
    ...theme.shadows.lg,
  },
  row: {
    flexDirection: 'row',
    width: '100%'
  },
  backContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  backText: {
    color: theme.colors.black,
    textDecorationLine: 'underline',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  }
});
