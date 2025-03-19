// ChannelChat.js - With Message Like Feature
import React, { useState, useEffect, useLayoutEffect } from "react";
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
  StatusBar,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useAuth } from "../../../../../context/authContext";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { database } from "../../../../../config/firebase";

export default function ChannelChat() {
  const [messages, setMessages] = useState([]);
  const [channelData, setChannelData] = useState(null); // To store channel doc (to check admin)
  const [inputText, setInputText] = useState("");
  const [doubleTapInfo, setDoubleTapInfo] = useState({
    messageId: null,
    lastTap: 0,
  });
  const [likeAnimation] = useState(new Animated.Value(0));
  const [animatingMessageId, setAnimatingMessageId] = useState(null);
  const { user } = useAuth();
  const { id } = useLocalSearchParams(); // The channel ID from route params

  // 1) Load channel info (to check if user is admin)
  useEffect(() => {
    if (!id) {
      console.log("No channel id provided.");
      return;
    }
    console.log("Fetching channel data for:", id);

    const channelRef = doc(database, "channels", id);
    const unsubscribeChannel = onSnapshot(channelRef, (snapshot) => {
      if (snapshot.exists()) {
        setChannelData(snapshot.data());
      } else {
        console.log("Channel does not exist or was deleted.");
      }
    });

    return () => {
      unsubscribeChannel();
    };
  }, [id]);

  // 2) Load messages from subcollection "messages" in real time
  useLayoutEffect(() => {
    if (!id) {
      console.log("No channel id provided. Returning early.");
      return;
    }

    console.log("Setting up messages snapshot listener for channel:", id);
    const messagesRef = collection(doc(database, "channels", id), "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log("Channel snapshot with", querySnapshot.size, "messages");

      const fetchedMessages = querySnapshot.docs.map((docSnap) => ({
        _id: docSnap.id,
        createdAt: docSnap.data().createdAt?.toDate(),
        text: docSnap.data().text,
        user: docSnap.data().user,
        read: docSnap.data().read || false,
        likes: docSnap.data().likes || [],
      }));

      setMessages(fetchedMessages);

      // 3) Mark unread messages as read if not from current user
      const unreadMessages = querySnapshot.docs.filter(
        (d) => !d.data().read && d.data().user._id !== user?.uid
      );

      const updatePromises = unreadMessages.map((unreadDoc) => {
        const msgRef = doc(database, "channels", id, "messages", unreadDoc.id);
        return updateDoc(msgRef, { read: true });
      });

      await Promise.all(updatePromises);
    });

    return unsubscribe;
  }, [id, user?.uid]);

  // Handle double tap for like
  const handleMessagePress = (messageId) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms

    if (
      doubleTapInfo.messageId === messageId &&
      now - doubleTapInfo.lastTap < DOUBLE_TAP_DELAY
    ) {
      // Double tap detected
      console.log("Double tap detected on message:", messageId);
      toggleLike(messageId);
      setDoubleTapInfo({ messageId: null, lastTap: 0 }); // Reset after double tap
    } else {
      // First tap or too slow, update last tap time
      setDoubleTapInfo({ messageId, lastTap: now });
    }
  };

  // Toggle like on a message
  const toggleLike = async (messageId) => {
    if (!user?.uid || !messageId) return;

    const message = messages.find((msg) => msg._id === messageId);
    if (!message) return;

    const hasLiked = message.likes.includes(user.uid);
    const messageRef = doc(database, "channels", id, "messages", messageId);

    try {
      // Update Firestore
      if (hasLiked) {
        // Remove like
        await updateDoc(messageRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        // Add like and show animation
        await updateDoc(messageRef, {
          likes: arrayUnion(user.uid),
        });

        // Trigger like animation
        setAnimatingMessageId(messageId);
        likeAnimation.setValue(0);
        Animated.sequence([
          Animated.timing(likeAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(likeAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setAnimatingMessageId(null);
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Send message function (only if user is admin)
  const sendMessage = async () => {
    // Check if user is admin
    if (!channelData || channelData.admin !== user?.uid) {
      return;
    }

    if (!inputText.trim() || !id) return;

    const messageData = {
      _id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date(),
      text: inputText.trim(),
      user: {
        _id: user.uid,
        name: user.displayName || "User",
      },
      read: true, // Mark as read immediately for admin messages
      likes: [], // Initialize empty likes array
    };

    // Add to local state first for immediate feedback
    setMessages((prevMessages) => [messageData, ...prevMessages]);
    setInputText(""); // Clear input

    // Send to Firestore
    try {
      const messagesRef = collection(doc(database, "channels", id), "messages");
      await addDoc(messagesRef, messageData);
      console.log("Message added successfully to Firestore (channel)!");
    } catch (error) {
      console.error("Error sending channel message:", error);
    }
  };

  // Render message item
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.user._id === user?.uid;
    const hasLiked = item.likes?.includes(user?.uid) || false;
    const likeCount = item.likes?.length || 0;
    const isAnimating = animatingMessageId === item._id;

    const heartScale = likeAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1.5, 1],
    });

    return (
      <TouchableWithoutFeedback onPress={() => handleMessagePress(item._id)}>
        <View style={styles.messageContainer}>
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
            <View style={styles.messageFooter}>
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

              {likeCount > 0 && (
                <View style={styles.likeContainer}>
                  <Text
                    style={{
                      ...styles.likeText,
                      color: isCurrentUser
                        ? "rgba(255, 255, 255, 0.7)"
                        : "#8E8E93",
                    }}
                  >
                    ❤️ {likeCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {isAnimating && (
            <Animated.View
              style={[
                styles.heartAnimation,
                {
                  transform: [{ scale: heartScale }],
                  alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={styles.heartIcon}>❤️</Text>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // Empty component for when there are no messages
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No messages yet.{" "}
        {channelData?.admin === user?.uid
          ? "Start the conversation!"
          : "Wait for an announcement."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.emptyListContent,
          ]}
          inverted
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
        />

        {/* Only show input if user is admin */}
        {channelData && channelData.admin === user?.uid && (
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
        )}
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
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    transform: [{ scaleY: -1 }], // Fix for inverted FlatList
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    transform: [{ scaleY: -1 }], // Fix for inverted FlatList
  },
  messageContainer: {
    position: "relative",
    marginVertical: 5,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 22,
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
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  likeContainer: {
    marginLeft: 6,
  },
  likeText: {
    fontSize: 10,
  },
  heartAnimation: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heartIcon: {
    fontSize: 30,
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
