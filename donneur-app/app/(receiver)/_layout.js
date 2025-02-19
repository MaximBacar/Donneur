import { Stack } from "expo-router";

const ReceiverLayout = () => {
  return(
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
export default ReceiverLayout;