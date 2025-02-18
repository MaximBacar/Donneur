import { collection, onSnapshot, query, addDoc, orderBy } from "firebase/firestore";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { database } from "../../config/firebase";
import { useAuth } from "../../context/authContext";
import { Text } from "react-native";

export default function Chat(){
    const [messages, setMessages] = useState([]);
    const { user, role, loading } = useAuth();

    useLayoutEffect(() =>{
        if (!user) return;
        const collectionRef = collection(database, 'chats');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, snapshot => {
            setMessages(
                snapshot.docs.map(doc => ({
                    _id: doc.id,
                    createdAt: doc.data().createdAt,
                    text: doc.data().text,
                    user: doc.data().user
                }))
            )
        });
        return () => unsubscribe();
    },[]);


    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        
        const {_id, createdAt, text, user} = messages[0];

        console.log("id:",_id);
        console.log("__user",user);
        addDoc(collection(database, 'chats'), {
            _id,
            createdAt,
            text,
            user
        });
    }, []);


    return(
        <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
            _id: user?.email
        }}/>
        
    )
}