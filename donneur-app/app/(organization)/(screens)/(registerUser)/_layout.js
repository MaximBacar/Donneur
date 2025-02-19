import { Stack } from 'expo-router'
import React from 'react'

const RegisterLayout = () => {
  return (
    <Stack options={{ headerShown: false }}>
        <Stack.Screen name="basicInfo"  />
        <Stack.Screen name="idDocument" />
        <Stack.Screen name="idPicture"  />
        <Stack.Screen name="registerNFC"/>
        <Stack.Screen name="registrationConfirmation"/>
        <Stack.Screen name="userEmail"/>
    </Stack>
  )
}

export default RegisterLayout