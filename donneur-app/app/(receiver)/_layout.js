import { Stack } from "expo-router";
import { ReceiverProvider } from "./receiverContext";
const ReceiverLayout = () => {
  return(
    <ReceiverProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
      </Stack>
    </ReceiverProvider>
  )
}
export default ReceiverLayout;