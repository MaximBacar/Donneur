import React from 'react';
import { Stack } from 'expo-router';

export default function WithdrawLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="withdraw"
        options={{ 
          title: 'Withdraw Funds',
          animation: 'slide_from_right'
        }}
      />
    </Stack>
  );
}