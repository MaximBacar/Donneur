import { useAuth } from '../../../context/authContext';
import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { database } from "../../../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { useRouter} from 'expo-router';

export default function Inbox() {
  const [chat, setchat] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    // Log the entire user object to confirm authentication
    console.log("User object:", user);

    // Stop if the user is not logged in
    if (!user) return;

    setLoading(true); // Start loading spinner

    const chatQuery = query(
      collection(database, "chat"),
      where("users", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      chatQuery,
      async (snapshot) => {
        try {
          const chatList = await Promise.all(
            snapshot.docs.map(async (chatDoc) => {
              const chat = chatDoc.data();
              const otherUserId = chat.users.find((userId) => userId !== user);

              // Directly get other user's name from the chat document (if you store it)
              const otherUserName = chat.userNames?.[otherUserId] || "Unknown User";

              // Fetch the last message on initial load
              const messagesRef = collection(database, "chat", chatDoc.id, "messages");
              const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(1));
              const messagesSnapshot = await getDocs(messagesQuery);

              const lastMessageData = messagesSnapshot.docs[0]?.data();
              const lastMessage = lastMessageData?.text || "No messages yet";
              const createdAt = lastMessageData?.createdAt?.toDate() || null;
              const read = lastMessageData?.read || false;

              // Ensure the blue circle only appears for the recipient
              const hasUnread =
                !read && // Message is unread
                lastMessageData?.user._id !== user; // Message was sent by someone else

              // Set up a real-time listener for the last message
              const unsubscribeMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
                const message = messagesSnapshot.docs[0]?.data();
                if (message) {
                  const updatedLastMessage = message.text || "Media message";
                  const updatedCreatedAt = message.createdAt?.toDate() || null;
                  const updatedRead = message?.read || false;

                  // Update the specific chat in the state
                  setchat((prevchat) =>
                    prevchat
                      .map((prevChat) =>
                        prevChat.id === chatDoc.id
                          ? {
                              ...prevChat,
                              lastMessage: updatedLastMessage,
                              createdAt: updatedCreatedAt,
                              read: updatedRead,
                              hasUnread:
                                !updatedRead && message.user._id !== user, // Recalculate unread indicator
                            }
                          : prevChat
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                  );
                }
              });

              return {
                id: chatDoc.id,
                otherUserName,
                lastMessage,
                createdAt,
                hasUnread,
                unsubscribeMessages, // Store the unsubscribe function
              };
            })
          );

          // Sort chats by createdAt before setting them in state
          const sortedchatList = chatList.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setchat(sortedchatList); // Update state with initial data
          setLoading(false); // Stop loading spinner
        } catch (error) {
          console.error("Error fetching chat:", error);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error with Firestore snapshot:", error);
        setLoading(false);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribe(); // Unsubscribe from chat listener
      chat.forEach((chatItem) => chatItem.unsubscribeMessages?.()); // Unsubscribe from message listeners
    };
  }, [user]); // <--- Also include user in the dependency array

  const openChat = (chat) => {
    router.push('/(inbox)/chats/'+chat.id);
    console.log("Opening chat:", chat.id);

    //navigation.navigate("Chat", {
     // chatId: chat.id,
      //otherUserName: chat.otherUserName,
    //});
  };

  if (loading) {
    return <Text>Loading chat...</Text>; // Display a loading message while fetching
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your chat</Text>
      <FlatList
        data={chat}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => openChat(item)}
          >
            <View style={styles.chatRow}>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>
                  Chat with: {item.otherUserName}
                </Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>
              {item.hasUnread && (
                <View style={styles.unreadIndicatorWrapper}>
                  <Text style={styles.unreadIndicatorText}>●</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "No messages yet"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  chatItem: {
    padding: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginBottom: 10,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  unreadIndicatorWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  unreadIndicatorText: {
    fontSize: 14,
    color: "#007bff", // Blue color for the unread indicator
    fontWeight: "bold",
  },
});
