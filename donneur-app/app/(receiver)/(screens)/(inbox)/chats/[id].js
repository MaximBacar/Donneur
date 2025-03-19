// Chat.js - Fixed Version with Proper Input Alignment
import { useAuth } from "../../../../../context/authContext";
import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { database } from "../../../../../config/firebase";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const { user } = useAuth();
  const { id } = useLocalSearchParams();

  // Load messages from Firestore
  useLayoutEffect(() => {
    if (!id) return;

    const collectionRef = collection(doc(database, "chat", id), "messages");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((docSnap) => ({
        _id: docSnap.id,
        createdAt: docSnap.data().createdAt?.toDate(),
        text: docSnap.data().text,
        user: docSnap.data().user,
        read: docSnap.data().read || false,
      }));

      setMessages(fetchedMessages);

      // Mark unread messages as read
      const unreadMessages = querySnapshot.docs.filter(
        (d) => !d.data().read && d.data().user._id !== user.uid
      );

      const updatePromises = unreadMessages.map((unreadDoc) => {
        const messageRef = doc(database, "chat", id, "messages", unreadDoc.id);
        return updateDoc(messageRef, { read: true });
      });

      await Promise.all(updatePromises);
    });

    return unsubscribe;
  }, [id]);

  // Send message function
  const sendMessage = async () => {
    if (!inputText.trim() || !id) return;

    const messageData = {
      _id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date(),
      text: inputText.trim(),
      user: {
        _id: user.uid,
        name: user.displayName || "User",
      },
      read: false,
    };

    // Add to local state first for immediate feedback
    setMessages((prevMessages) => [messageData, ...prevMessages]);
    setInputText(""); // Clear input

    // Send to Firestore
    try {
      const collectionRef = collection(doc(database, "chat", id), "messages");
      await addDoc(collectionRef, messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Render message item
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.user._id === user.uid;

    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        <Text
          style={{
            ...styles.messageText,
            color: isCurrentUser ? "#FFFFFF" : "#000000",
          }}
        >
          {item.text}
        </Text>
        <Text
          style={{
            ...styles.timeText,
            color: isCurrentUser ? "rgba(255, 255, 255, 0.7)" : "#8E8E93",
          }}
        >
          {item.createdAt
            ? item.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
          inverted
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline={Platform.OS === "ios"}
            textAlignVertical="center"
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text
              style={[
                styles.sendButtonText,
                !inputText.trim() ? styles.sendButtonDisabled : null,
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageList: {
    padding: 10,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 22,
    marginVertical: 5,
  },
  currentUserBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 18,
  },
  otherUserBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E9E9EB",
    borderBottomLeftRadius: 18,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#E9E9EB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    minHeight: 40,
    lineHeight: 20,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
