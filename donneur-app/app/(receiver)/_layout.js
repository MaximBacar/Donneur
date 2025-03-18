import { Stack } from "expo-router";

const ReceiverLayout = () => {
  return(
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(screens)" />
    </Stack>
  )
}
export default ReceiverLayout;