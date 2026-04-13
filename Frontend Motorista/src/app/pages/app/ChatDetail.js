import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import Text from '../../layouts/Components/Text';
import AppLayout from '../../layouts/Layouts/AppLayout';
import { WS_BASE_URL } from '../../../api/config';

export default function ChatDetail({ route, navigation }) {
  const { name, chatId } = route.params || { name: 'Chat', chatId: null };

  // Estados para mensagens e input
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const ws = React.useRef(null);

  React.useEffect(() => {
    if (!chatId) return;

    // Conecta ao websocket do chat usando o ID do frete
    const wsUrl = `${WS_BASE_URL}/ws/chat/${chatId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log("Motorista conectado ao chat:", wsUrl);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Só adiciona se a mensagem não for dele mesmo para não duplicar,
        // ou você pode simplesmente adicionar tudo que vem do servidor.
        // Vamos adicionar tudo para garantir consistência.
        setMessages((prev) => {
          // Evita adicionar duplicado caso receba o próprio eco
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } catch (e) {
        console.error("Erro no chat", e);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [chatId]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: String(Date.now()),
      text: inputText.trim(),
      sender: 'driver',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Atualiza localmente imediatamente
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Envia para o servidor WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(newMsg));
    }
  };

  return (
    <AppLayout
      title={name}
      onBack={() => navigation.goBack()}
      rightComponent={
        <TouchableOpacity onPress={() => navigation.navigate('Negotiation')}>
          <Text style={{ fontSize: 22 }}>🤝</Text>
        </TouchableOpacity>
      }
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FF914D' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.scrollWrapper}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => (
                <View key={msg.id} style={msg.sender === 'driver' ? styles.msgRight : styles.msgLeft}>
                  <Text style={msg.sender === 'driver' ? styles.msgTextRight : styles.msgTextLeft}>
                    {msg.text}
                  </Text>
                  <Text style={msg.sender === 'driver' ? styles.msgTimeRight : styles.msgTimeLeft}>
                    {msg.time} {msg.sender === 'driver' ? '✓✓' : ''}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputArea}>
            <TextInput
              placeholder="Digite aqui..."
              style={styles.input}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.7} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 12,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  scrollWrapper: { flex: 1 },
  scrollContent: { padding: 15, flexGrow: 1 },

  msgRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF914D',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 2,
    marginBottom: 12,
    maxWidth: '80%',
  },
  msgLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 2,
    marginBottom: 12,
    maxWidth: '80%',
    elevation: 1,
  },
  msgTextRight: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  msgTextLeft: { color: '#333', fontSize: 16 },
  msgTimeRight: { color: '#FFF', fontSize: 10, alignSelf: 'flex-end', marginTop: 4, opacity: 0.8 },
  msgTimeLeft: { color: '#999', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingTop: 12,
    marginBottom: 30,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    borderRadius: 20,
    elevation: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#FF914D',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});