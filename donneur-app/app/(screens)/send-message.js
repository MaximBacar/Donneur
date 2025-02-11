import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function SendMessageScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey there!', sender: 'them' },
    { id: '2', text: 'Hello! How’s it going?', sender: 'me' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const flatListRef = useRef(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  function handleSend() {
    if (!inputValue.trim()) return; // Ignore empty messages

    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'me',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  }

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.messageBubbleMe : styles.messageBubbleThem,
        ]}
      >
        <Text style={[styles.messageText, isMe && { color: '#fff' }]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with Sarah</Text>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90} // Adjust as needed for your header
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    height: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  messageBubbleMe: {
    backgroundColor: '#1DA1F2',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  messageBubbleThem: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#1DA1F2',
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
