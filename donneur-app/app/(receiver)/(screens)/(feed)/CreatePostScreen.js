import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAddPost } from "./postService";
import { useAuth } from "../../../../context/authContext";

import { BACKEND_URL } from "../../../../constants/backend";

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, userData, role, token } = useAuth();
  const addPost = useAddPost();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // Reset text & image every time this screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setText("");
      setImage(null);
    });
    return unsubscribe;
  }, [navigation]);


  const publishPost = async (text) => {
    let url = `${BACKEND_URL}/feed/create`;
    console.log(text);
    const payload = {
      content : {'text' : text},
      visibility : 'all'
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning' : 'remove-later'
      },
      body:JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log(data);

  }

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Cancel button logic
  const handleCancel = () => {
    // If there's any text or image, ask for confirmation
    if (text.trim() || image) {
      Alert.alert(
        "Discard changes?",
        "Are you sure you want to discard your post?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: () => router.push("/(tabs)/social/"), // Go to feed
          },
        ]
      );
    } else {
      // No text or image? Just go home
      router.push("/(tabs)/social/");
    }
  };

  // Handle creating post
  const handlePost = async () => {
    if (!text.trim() && !image) {
      Alert.alert("Post is empty!", "Write something or add an image.");
      return;
    }

    try {
      setIsPosting(true);
      // await addPost(text, image);
      await publishPost(text);
      setIsPosting(false);

      // Show an Alert with an "OK" button
      Alert.alert("Post Created!", "Your post has been shared successfully.", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)/social/"), // Navigate on "OK"
        },
      ]);
    } catch (error) {
      setIsPosting(false);
      console.log(error);
      Alert.alert("Error", "Could not create post. Please try again later.");
    }
  };

  const canPost = text.trim().length > 0 || image !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Cancel button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCancel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create a new post</Text>

          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.postButtonContainer,
              !canPost && styles.disabledButton,
            ]}
            onPress={handlePost}
            disabled={!canPost || isPosting}
          >
            {isPosting ? (
              <View style={styles.loadingIndicator} />
            ) : (
              <Text
                style={[styles.postButton, !canPost && styles.disabledText]}
              >
                Publish
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* User info row */}
        <View style={styles.userInfoRow}>
          <Image
            source={{
              uri: userData?.logo_id || userData?.id_picture_file || "https://i.pravatar.cc/300",
            }}
            style={styles.userAvatar}
          />

          <View style={styles.userNameContainer}>
            {/* Replaced "John Doe" with user.uid */}
            <Text style={styles.userName}>{userData?.name || userData?.first_name + " " + userData?.last_name || 'Loading error'}</Text>
            <Text style={styles.timeText}>Now</Text>
          </View>
        </View>

        {/* Scrollable content for text + image */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            value={text}
            onChangeText={setText}
            autoFocus
          />

          {/* Image Preview (with remove & full-screen) */}
          {image && (
            <View style={styles.imageContainer}>
              {/* 'X' to remove image */}
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle-sharp" size={24} color="white" />
              </TouchableOpacity>

              {/* Tap image to view full-screen */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setFullScreenImage(image)}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Row (Pick Image Only) */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <View style={styles.iconCircle}>
              <Ionicons name="image" size={22} color="#000" />
            </View>
            <Text style={styles.iconText}>Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Full-Screen Image Modal (with X button) */}
        {fullScreenImage && (
          <Modal visible={true} transparent={true} animationType="fade">
            <View style={styles.fullScreenContainer}>
              <TouchableOpacity
                style={styles.fullScreenBackground}
                activeOpacity={1}
                onPress={() => setFullScreenImage(null)}
              >
                <Image
                  source={{ uri: fullScreenImage }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />

                {/* 'X' to close full-screen */}
                <TouchableOpacity
                  style={styles.fullScreenClose}
                  onPress={() => setFullScreenImage(null)}
                >
                  <Ionicons name="close-circle-sharp" size={40} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  postButtonContainer: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#eee",
  },
  loadingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFF",
    borderTopColor: "transparent",
    alignSelf: "center",
  },
  cancelButton: {
    color: "#333",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  postButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  disabledText: {
    color: "#999",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#000",
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  textInput: {
    minHeight: 120,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
    textAlignVertical: "top",
    padding: 0,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
  },
  previewImage: {
    width: "100%",
    height: 280,
    borderRadius: 12,
  },
  bottomRow: {
    flexDirection: "row",
    padding: 16,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconText: {
    fontSize: 14,
    color: "#333",
  },
  // Full-Screen
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  fullScreenBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
});
