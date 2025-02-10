import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import IconSymbol from '../../components/ui/IconSymbol'; // Ensure correct import path

// MOCK DATA
const friendsData = [
  { id: 'header-online', type: 'header', title: 'Online Friends' },
  { id: '1', name: 'Alice Johnson', type: 'friend', status: 'online' },
  { id: '2', name: 'Bob Smith', type: 'friend', status: 'online' },
  { id: 'header-offline', type: 'header', title: 'Offline Friends' },
  { id: '3', name: 'Charlie Brown', type: 'friend', status: 'offline' },
  { id: '4', name: 'David Miller', type: 'friend', status: 'offline' },
  { id: '5', name: 'Eve Adams', type: 'friend', status: 'offline' },
];

export default function FriendsScreen() {
  const router = useRouter();

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    return (
      <View style={styles.friendItem}>
        <Text style={styles.friendName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push('/send-message')}
        >
          <IconSymbol size={24} name="message.fill" color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mockDataText}>MOCK DATA</Text>

      {/* FlatList for entire screen */}
      <FlatList
        data={friendsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flatListContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  mockDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageButton: {
    padding: 8,
  },
});
