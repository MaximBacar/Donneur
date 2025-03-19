import { Stack } from "expo-router";
// Add this at the top of your entry file (e.g., App.js or index.js)
import { LogBox } from 'react-native';

// Ignore this specific warning
LogBox.ignoreLogs(['Warning: Text strings must be rendered within a <Text> component']);
const OrganizationLayout = () => {
  return(
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(screens)" />
    </Stack>
  )
}
export default OrganizationLayout;