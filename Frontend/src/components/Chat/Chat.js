import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send } from 'lucide-react-native';
import { theme } from '../../theme';
import { API_BASE_URL, WS_BASE_URL } from '../../api/config';

const Chat = ({ onNavigate, freteId, route, navigation }) => {
    const currentFreteId = route?.params?.freteId || freteId || 1;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        if (!currentFreteId) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/ws/chat/${currentFreteId}/historico?role=user`);

                if (res.ok) {
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        setMessages(data);
                    }
                }
            } catch (err) {
                console.error("Erro buscando historico:", err);
            }
        };

        fetchHistory();

        const wsUrl = `${WS_BASE_URL}/ws/chat/${currentFreteId}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => console.log("Cliente conectado ao chat:", wsUrl);

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.erro) {
                    console.error("Erro recebido do websocket:", data.erro);
                    return;
                }

                setMessages((prev) => {
                    if (prev.find(m => String(m.id) === String(data.id))) return prev;
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
            text: inputText.trim(),
            sender: 'user',
        };

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
                        <Text style={styles.avatarText}>M</Text>
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
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => onNavigate('accepted', { freightId: currentFreteId })} style={styles.backButton}>
                        <ArrowLeft color={theme.colors.white} size={24} />
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
                keyExtractor={item => String(item.id)}
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
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Send color={theme.colors.white} size={20} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.lg },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: {
        width: 44, height: 44,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.white },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

    chatList: { padding: theme.spacing.lg },
    messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowDriver: { justifyContent: 'flex-start' },

    avatar: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: theme.colors.surfaceAlt,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: theme.colors.textSecondary, fontWeight: 'bold' },

    bubble: { maxWidth: '80%', padding: 12, borderRadius: theme.borderRadius.xl },
    bubbleUser: { backgroundColor: theme.colors.accent, borderBottomRightRadius: 4 },
    bubbleDriver: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: theme.colors.border,
    },

    messageText: { fontSize: 14, marginBottom: 4 },
    messageTextUser: { color: theme.colors.white },
    messageTextDriver: { color: theme.colors.text },

    timeText: { fontSize: 10, alignSelf: 'flex-end' },
    timeTextUser: { color: 'rgba(255,255,255,0.7)' },
    timeTextDriver: { color: theme.colors.textSecondary },

    inputContainer: {
        flexDirection: 'row', padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1, borderTopColor: theme.colors.border,
        alignItems: 'center', gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.borderRadius.round,
        paddingHorizontal: theme.spacing.md, paddingVertical: 10,
        fontSize: 14, color: theme.colors.text,
    },
    sendButton: {
        width: 44, height: 44,
        backgroundColor: theme.colors.accent,
        borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        ...theme.shadows.sm,
    },
});

export default Chat;
