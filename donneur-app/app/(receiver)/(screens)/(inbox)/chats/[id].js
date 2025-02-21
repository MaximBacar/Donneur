// Chat.js
import { useAuth } from '../../../../../context/authContext';
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useLocalSearchParams } from 'expo-router';
import {
  collection,
  doc,
  query,
  onSnapshot,
  orderBy,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { database } from '../../../../../config/firebase';
import { Text } from 'react-native';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const { user } = useAuth()

  // 1) Get the `id` from the URL
  const { id } = useLocalSearchParams();
  console.log('Chat ID from route:', id);

  // 2) Load messages from the subcollection "messages" in real time
  useLayoutEffect(() => {
    if (!id) {
      console.log('No id provided. Returning early.');
      return;
    }

    console.log('Setting up snapshot listener for id:', id);
    const collectionRef = collection(doc(database, 'chat', id), 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log('Received snapshot with', querySnapshot.size, 'messages');
      const fetchedMessages = querySnapshot.docs.map((docSnap) => ({
        _id: docSnap.id,
        createdAt: docSnap.data().createdAt?.toDate(),
        text: docSnap.data().text,
        user: docSnap.data().user,
        read: docSnap.data().read || false,
      }));

      setMessages(fetchedMessages);

      // Mark unread messages as read if not from current user
    
      const unreadMessages = querySnapshot.docs.filter(
        (d) => !d.data().read && d.data().user._id !== user.uid
      );

      const updatePromises = unreadMessages.map((unreadDoc) => {
        const messageRef = doc(database, 'chat', id, 'messages', unreadDoc.id);
        return updateDoc(messageRef, { read: true });
      });

      await Promise.all(updatePromises);
    });

    return unsubscribe;
  }, [id]);

  // 3) Handle sending a new message
  const onSend = useCallback(
    async (newMessages = []) => {
      if (!id || newMessages.length === 0) {
        console.log('No id or empty message. Aborting send.');
        return;
      }

      console.log('Sending new message to id:', id);
      const collectionRef = collection(doc(database, 'chat', id), 'messages');

      // Update local state so user sees the message instantly
      setMessages((prev) => GiftedChat.append(prev, newMessages));

      const { _id, createdAt, text, user } = newMessages[0];

      try {
        // 4) Attempt to add doc to Firestore
        await addDoc(collectionRef, {
          _id,
          createdAt,
          text,
          user,
          read: false, // Mark as unread initially
        });
        console.log('Message added successfully to Firestore!');
      } catch (error) {
        // 5) Catch any error (permissions, path, etc.)
        console.error('Error sending message:', error);
      }
    },
    [id]
  );


  console.log("User object:", user);
  const userId = user ? user.uid : 'anonymous';

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMsgs) => onSend(newMsgs)}
      user={{
        _id: userId,
        name: user.displayName || 'User',
      }}
    />
  );
}

const styles = StyleSheet.create({
  // ...styles if needed
});