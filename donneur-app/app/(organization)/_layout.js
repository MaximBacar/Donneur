import { Stack } from "expo-router";

const OrganizationLayout = () => {
  return(
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(screens)" />
    </Stack>
  )
}
export default OrganizationLayout;