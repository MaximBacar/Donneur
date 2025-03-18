import { Stack } from "expo-router";

export default function Layout({ children }) {
  return <Stack screenOptions={{ headerShown: false }}>{children}</Stack>;
}
