// ChannelChat.js
import React, {
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import { StyleSheet } from "react-native";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
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
  getDoc,
} from "firebase/firestore";
import { database } from "../../../../../config/firebase";

export default function ChannelChat() {
  const [messages, setMessages] = useState([]);
  const [channelData, setChannelData] = useState(null); // To store channel doc (to check admin)
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

  // 4) Handle sending a new message
  const onSend = useCallback(
    async (newMessages = []) => {
      if (!id || newMessages.length === 0) {
        console.log("No id or empty message. Aborting send.");
        return;
      }

      console.log("Sending new message to channel:", id);
      const messagesRef = collection(doc(database, "channels", id), "messages");

      // Update local state immediately
      setMessages((prev) => GiftedChat.append(prev, newMessages));

      const { _id, createdAt, text, user } = newMessages[0];

      try {
        // Add doc to Firestore
        await addDoc(messagesRef, {
          _id,
          createdAt,
          text,
          user,
          read: false,
        });
        console.log("Message added successfully to Firestore (channel)!");
      } catch (error) {
        console.error("Error sending channel message:", error);
      }
    },
    [id]
  );

  // 5) Conditionally hide input if user is NOT admin
  // GiftedChat lets us override the InputToolbar to hide/disable it.
  function renderInputToolbar(props) {
    if (channelData && channelData.admin !== user?.uid) {
      // If not admin, hide the input
      return null;
    }
    // Otherwise, show normal input
    return <InputToolbar {...props} />;
  }

  // 6) Prepare GiftedChat user
  const userId = user ? user.uid : "anonymous";

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMsgs) => onSend(newMsgs)}
      user={{
        _id: userId,
        name: user?.displayName || "User",
      }}
      renderInputToolbar={renderInputToolbar}
    />
  );
}

const styles = StyleSheet.create({
  // ...Add styles if needed
});
