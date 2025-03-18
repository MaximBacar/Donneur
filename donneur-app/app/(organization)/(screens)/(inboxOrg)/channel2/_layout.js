import { Stack } from "expo-router";
import React from "react";
import { useAuth } from "../../../../../context/authContext";

const InboxLayout = () => {
  const { user } = useAuth();

  return (
    <Stack options={{ headerShown: false }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default InboxLayout;
