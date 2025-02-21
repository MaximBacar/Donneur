import { Stack } from 'expo-router'
import React from 'react'


const InboxLayout = () => {
  return (

    <Stack options={{ headerShown: false }}>
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
    
  )
}

export default InboxLayout