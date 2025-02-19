import { Stack } from 'expo-router'
import React from 'react'

const WithdrawalLayout = () => {
  return (
    <Stack options={{ headerShown: false }}>
        <Stack.Screen name="withdrawal"             options={{ headerShown: false }} />
        <Stack.Screen name="idConfirmation"         options={{ headerShown: false }} />
        <Stack.Screen name="withdrawalAmount"       options={{ headerShown: false }} />
        <Stack.Screen name="withdrawalConfirmation" options={{ headerShown: false }} />
    </Stack>
  )
}

export default WithdrawalLayout