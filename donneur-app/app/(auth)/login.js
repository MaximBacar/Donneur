import React from "react";
import {View, Text, SafeAreaView, TextInput, TouchableOpacity} from 'react-native'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useState } from "react";
import { router } from "expo-router";

export default function Index(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = async () => {
        try{
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace('/');
        } catch (error){
            console.log(error);
            alert('Sign In Failed');
        }
    }
    const signUp = async () => {
        try{
            const user = await createUserWithEmailAndPassword(auth, email, password);
        } catch (error){
            console.log(error);
            alert('Sign Up Failed');
        }
    }

    return (
        <SafeAreaView>
            <Text> Login</Text>
            <TextInput placeholder="email" value={email} onChangeText={setEmail}/>
            <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry/>

            <Text>{email}</Text>
            <TouchableOpacity onPress={signIn}>
                <Text>Login</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}