import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AppLayout from '../../layouts/Layouts/AppLayout';

export default function ChatList({ navigation }) {
  // Estado para lista de conversas (futuramente virá do backend)
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'Guilherme Capriata',
      lastMessage: 'Tá onde jogadô?',
      time: '22:45',
      unread: 2,
      avatarColor: '#FF914D'
    },
    {
      id: '2',
      name: 'Maria Silva',
      lastMessage: 'Obrigado pelo serviço!',
      time: 'Ontem',
      unread: 0,
      avatarColor: '#D81B60'
    }
  ]);
  const [refreshing, setRefreshing] = useState(false);

  // Futuramente: buscar conversas do backend
  // const fetchChats = async () => {
  //   const response = await axios.get(`${API_BASE_URL}/chats/`);
  //   setChats(response.data);
  // };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, name: item.name })}
    >
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AppLayout title="Conversas">
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
              Nenhuma conversa ainda
            </Text>
          </View>
        }
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 10 },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  time: { fontSize: 12, color: '#999' },
  lastMessage: { fontSize: 14, color: '#666', flex: 1, marginRight: 10 },
  unreadBadge: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});
