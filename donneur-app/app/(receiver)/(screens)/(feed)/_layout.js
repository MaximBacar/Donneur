import { Stack } from "expo-router";

const FeedLayout = () => {
  return(
    <Stack>
      <Stack.Screen name="CommentScreen" options={{ headerShown: false }} />
      <Stack.Screen name="AnswerScreen" options={{ headerShown: false }} />
      <Stack.Screen name="CreatePostScreen" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
export default FeedLayout;