import { Stack } from 'expo-router'
import React from 'react'
import { UserProvider } from './withdrawalContext'

const WithdrawalLayout = () => {
  return (
    <UserProvider>
      <Stack options={{ headerShown: false }}>
        <Stack.Screen name="withdrawal"             options={{ headerShown: false }} />
        <Stack.Screen name="qrcode"                 options={{ headerShown: false }} />
        <Stack.Screen name="idConfirmation"         options={{ headerShown: false }} />
        <Stack.Screen name="withdrawalAmount"       options={{ headerShown: false }} />
        <Stack.Screen name="withdrawalConfirmation" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
    
  )
}

export default WithdrawalLayout