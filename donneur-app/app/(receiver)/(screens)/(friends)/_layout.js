import { Stack } from 'expo-router'
import React from 'react'


const FriendLayout = () => {
  return (

    <Stack options={{ headerShown: false }}>
        <Stack.Screen name="friends"            options={{ headerShown: false }} />
        <Stack.Screen name="addFriend"          options={{ headerShown: false }} />
        <Stack.Screen name="readFriendCode"     options={{ headerShown: false }} />
        <Stack.Screen name="[friend_db_id]"     options={{ headerShown: false }} />
        <Stack.Screen name="AvatarWithLoading"  options={{ headerShown: false }} />
    </Stack>
    
  )
}

export default FriendLayout