import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../../layouts/Components/Text';
import Header from '../../layouts/Components/Header';

export default function Chat({ navigation }) {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Tá onde jogadô?', sender: 'me', time: '22:45' },
        { id: '2', text: 'Eu vou levar um armário além da geladeira, beleza?', sender: 'other', time: '22:50' },
        { id: '3', text: 'KAKAKAKAKAKAKAK', sender: 'me', time: '22:58' },
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = {
            id: String(Date.now()),
            text: inputText.trim(),
            sender: 'me',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, newMsg]);
        setInputText('');
    };

    return (
        <View style={styles.container}>
            <Header title="Chat de Negociação" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {messages.map((msg) => (
                    <View key={msg.id} style={msg.sender === 'me' ? styles.msgRight : styles.msgLeft}>
                        <Text style={msg.sender === 'me' ? styles.msgTextRight : styles.msgTextLeft}>
                            {msg.text}
                        </Text>
                        <Text style={msg.sender === 'me' ? styles.msgTimeRight : styles.msgTimeLeft}>
                            {msg.time} {msg.sender === 'me' ? '✓✓' : ''}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={styles.inputArea}>
                    <TextInput
                        placeholder="Digite aqui"
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <Text style={styles.sendBtnText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    scrollContent: { padding: 20, paddingBottom: 80 },
    msgRight: {
        alignSelf: 'flex-end', backgroundColor: '#2962FF', padding: 15,
        borderRadius: 20, borderBottomRightRadius: 2, marginBottom: 10, maxWidth: '80%'
    },
    msgLeft: {
        alignSelf: 'flex-start', backgroundColor: '#448AFF', padding: 15,
        borderRadius: 20, borderBottomLeftRadius: 2, marginBottom: 10, maxWidth: '80%'
    },
    msgTextRight: { color: '#FFF', fontSize: 16 },
    msgTextLeft: { color: '#FFF', fontSize: 16 },
    msgTimeRight: { color: '#EEE', fontSize: 10, alignSelf: 'flex-end', marginTop: 5 },
    msgTimeLeft: { color: '#EEE', fontSize: 10, alignSelf: 'flex-end', marginTop: 5 },
    inputArea: {
        padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE',
        flexDirection: 'row', alignItems: 'center'
    },
    input: {
        flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingVertical: 10,
        paddingHorizontal: 20, fontSize: 16
    },
    sendBtn: {
        marginLeft: 10, backgroundColor: '#2962FF', paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20,
    },
    sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
