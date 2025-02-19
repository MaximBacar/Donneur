import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/authContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
