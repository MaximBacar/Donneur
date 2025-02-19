import { Stack } from "expo-router";

const OrganizationLayout = () => {
  return(
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
export default OrganizationLayout;