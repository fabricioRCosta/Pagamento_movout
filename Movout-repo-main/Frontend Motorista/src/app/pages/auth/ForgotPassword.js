import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AuthLayout from '../../layouts/Layouts/AuthLayout';
import MyButton from '../../layouts/Components/button';
import MyInput from '../../layouts/Components/Input';
import logoImg from '../../../../assets/logo.png';

export default function ForgotPassword({ navigation }) {
  return (
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={logoImg}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            Enviaremos um link para o seu e-mail
          </Text>
        </View>

        <View style={styles.card}>
          <MyInput
            label="Seu e-mail cadastrado"
            placeholder="exemplo@gmail.com"
            keyboardType="email-address"
          />

          <MyButton title="Enviar Link" onPress={() => { }} />

          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  subtitle: {
    fontSize: 16,
    color: '#000',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 25,
    width: '85%',
    maxWidth: 360,
    minWidth: 300,
    elevation: 15,
    alignItems: 'center',
  },
  backText: {
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'underline',
  },
});
