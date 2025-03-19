import { Stack } from 'expo-router'
import React from 'react'
import { UserProvider } from './registerContext'

const RegisterLayout = () => {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="basicInfo"                options={{ headerShown: false }}/>
          <Stack.Screen name="idDocument"               options={{ headerShown: false }}/>
          <Stack.Screen name="idPicture"                options={{ headerShown: false }}/>
          <Stack.Screen name="registerNFC"              options={{ headerShown: false }}/>
          <Stack.Screen name="registrationConfirmation" options={{ headerShown: false }}/>
          <Stack.Screen name="userEmail"                options={{ headerShown: false }}/>
      </Stack>
    </UserProvider>
  )
}

export default RegisterLayout