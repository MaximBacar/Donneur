import React from "react";
import { Text } from "react-native";
import { Redirect } from 'expo-router';
import { useAuth } from "../context/authContext";

export default function Index() {
    const { user, role, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        console.log("Redirecting to login...");
        return <Redirect href="/(auth)/login" />;
    } 
    if (user){
        if (role === "organizations") {
            return <Redirect href="/(organization)" />;
        } 
        if (role == "receivers"){
            return <Redirect href="/(receiver)" />;
        }

        if (role == "senders"){
            return <Redirect href="/(sender)" />;
        }
        
        else {
            return null;
        }
    }
}
