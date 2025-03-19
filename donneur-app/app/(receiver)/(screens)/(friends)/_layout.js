import { Stack } from 'expo-router'
import React from 'react'

import { FriendProvider } from './friendContext'


const FriendLayout = () => {
  return (
    <FriendProvider>
       <Stack options={{ headerShown: false }}>
          <Stack.Screen name="friends"            options={{ headerShown: false }} />
          <Stack.Screen name="addFriend"          options={{ headerShown: false }} />
          <Stack.Screen name="readFriendCode"     options={{ headerShown: false }} />
          <Stack.Screen name="friendProfile"      options={{ headerShown: false }} />
          <Stack.Screen name="AvatarWithLoading"  options={{ headerShown: false }} />
          <Stack.Screen name="confirmAddFriend"  options={{ headerShown: false }} />
      </Stack>
    </FriendProvider>
   
    
  )
}

export default FriendLayout