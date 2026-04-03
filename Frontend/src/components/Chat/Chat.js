import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send } from 'lucide-react-native';
import { WS_BASE_URL } from '../../api/config';

const Chat = ({ onNavigate, freteId, route, navigation }) => {
    // Captura o ID caso venha pelo React Navigation ou via props diretas
    const currentFreteId = route?.params?.freteId || freteId || 1;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        if (!currentFreteId) return;

        const wsUrl = `${WS_BASE_URL}/ws/chat/${currentFreteId}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => console.log("Cliente conectado ao chat:", wsUrl);

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prev) => {
                    if (prev.find(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            } catch (e) {
                console.error("Erro recebendo msg chat", e);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [currentFreteId]);

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(newMessage));
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowDriver]}>
                {!isUser && (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>C</Text>
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleDriver]}>
                    <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextDriver]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextDriver]}>
                        {item.time}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#F4A259', '#D97706']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => onNavigate('accepted', { freightId: currentFreteId })} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Carlos Oliveira</Text>
                        <Text style={styles.headerSubtitle}>Motorista • Volkswagen Saveiro</Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatList}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua mensagem..."
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Send color="white" size={20} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { padding: 20, paddingTop: 50, paddingBottom: 20 },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

    chatList: { padding: 20 },
    messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowDriver: { justifyContent: 'flex-start' },

    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#4B5563', fontWeight: 'bold' },

    bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
    bubbleUser: { backgroundColor: 'black', borderBottomRightRadius: 4 },
    bubbleDriver: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },

    messageText: { fontSize: 14, marginBottom: 4 },
    messageTextUser: { color: 'white' },
    messageTextDriver: { color: '#1F2937' },

    timeText: { fontSize: 10, alignSelf: 'flex-end' },
    timeTextUser: { color: 'rgba(255,255,255,0.7)' },
    timeTextDriver: { color: '#9CA3AF' },

    inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center', gap: 12 },
    input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1F2937' },
    sendButton: { width: 44, height: 44, backgroundColor: 'black', borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 }
});

export default Chat;
