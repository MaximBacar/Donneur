// Chat.js
import { useAuth } from '../../../../context/authContext';
import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StatusBar,
    Platform,
    Modal,
    Animated,
  } from "react-native";

export default function Post() {
    const [messages, setMessages] = useState([]);
    const { user } = useAuth()

    const { id } = useLocalSearchParams();
    console.log('POST:', id);


    return (<View>
        <Text>POST {id}</Text>
    </View>)


}

const styles = StyleSheet.create({
  // ...styles if needed
});