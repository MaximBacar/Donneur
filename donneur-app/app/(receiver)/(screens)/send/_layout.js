import React from 'react';
import { Stack } from 'expo-router';

export default function SendLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SendMoney"
        options={{ 
          title: 'Send Money',
          presentation: 'modal' 
        }}
      />
    </Stack>
  );
}