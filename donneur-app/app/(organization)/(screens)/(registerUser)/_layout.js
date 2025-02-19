import { Stack } from 'expo-router'
import React from 'react'
import { UserProvider } from './registerContext'

const RegisterLayout = () => {
  return (
    <UserProvider>
      <Stack options={{ headerShown: false }}>
          <Stack.Screen name="basicInfo"  />
          <Stack.Screen name="idDocument" />
          <Stack.Screen name="idPicture"  />
          <Stack.Screen name="registerNFC"/>
          <Stack.Screen name="registrationConfirmation"/>
          <Stack.Screen name="userEmail"/>
      </Stack>
    </UserProvider>
  )
}

export default RegisterLayout