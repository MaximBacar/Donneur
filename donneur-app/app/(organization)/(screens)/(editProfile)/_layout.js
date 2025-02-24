import { Stack } from "expo-router";

const EditProfileLayout = () => {
  return(

       <Stack options={{ headerShown: false }}>
              <Stack.Screen name="editProfile" options={{ headerShown: false }} />
        </Stack>
   
  )
}
export default EditProfileLayout;