import React, { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from "react-native";
// Replace uuid with a different approach
import { ref, uploadBytes, getDownloadURL, updateMetadata } from "firebase/storage";
import { storage } from "../../../../config/firebase";
import { useAuth } from "../../../../context/authContext";
import { BACKEND_URL } from "../../../../constants/backend";

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orgId = params.id;
  
  const [profilePic, setProfilePic] = useState(
    "https://via.placeholder.com/100/4A90E2/FFFFFF.png?text=CM"
  );
  const [banner, setBanner] = useState(
    "https://via.placeholder.com/600x200/ACACAC.png"
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zip, setZip] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [maxOccupancy, setMaxOccupancy] = useState("");
  const [is24Hours, setIs24Hours] = useState(true);
  const [currentOccupancy, setCurrentOccupancy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const { user, token, donneurID } = useAuth();

  // Fetch organization data to populate the form
  useEffect(() => {
    const fetchOrgData = async () => {
      setIsFetching(true);
      try {
        const id = orgId || donneurID;
        if (!id) {
          console.error("No organization ID available");
          setIsFetching(false);
          return;
        }
        
        const url = `${BACKEND_URL}/organization/get?id=${id}`;
        console.log("Fetching organization data for ID:", id);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch organization data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched organization data:", data);
        
        // Populate form fields with organization data
        if (data) {
          // Basic info
          setName(data.name || "");
          setDescription(data.description || "");
          
          // Contact info
          if (data.address) {
            setAddress(data.address.street || "");
            setCity(data.address.city || "");
            setProvince(data.address.state || "");
            setZip(data.address.postalcode || "");
          }
          
          setPhoneNumber(data.phone || "");
          
          // Capacity info
          setMaxOccupancy(data.max_occupancy ? data.max_occupancy.toString() : "");
          setCurrentOccupancy(data.current_occupancy ? data.current_occupancy.toString() : "");
          setIs24Hours(data.is_24_hours !== undefined ? data.is_24_hours : true);
          
          // Images
          if (data.logo_file) {
            setProfilePic(data.logo_file);
          }
          
          if (data.banner_file) {
            setBanner(data.banner_file);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
        Alert.alert(
          "Error",
          "Failed to load organization data. Please try again."
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrgData();
  }, [orgId, donneurID]);

  // Function to generate a unique filename without using uuid
  const generateUniqueFilename = () => {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `image_${timestamp}_${randomStr}.png`;
  };

  const uploadImage = async (blob, isLogo = true) => {
    try {
      // STORE IMAGE IN FIREBASE WITH UNIQUE FILENAME
      const filename = generateUniqueFilename();
      const imageRef = ref(storage, `/images/${filename}`);
      await uploadBytes(imageRef, blob);

      await updateMetadata(imageRef, {
        cacheControl: "public,max-age=31536000", // Long-term cache
        contentType: "image/png",
      });

      // GET IMAGE URL
      const publicURL = `https://firebasestorage.googleapis.com/v0/b/${
        storage.app.options.storageBucket
      }/o/${encodeURIComponent(imageRef.fullPath)}?alt=media`;

      // Send to the appropriate backend endpoint (logo or banner)
      await sendLinkToBackEnd(publicURL, isLogo);

      console.log(`Firebase URL (${isLogo ? 'logo' : 'banner'}):`, publicURL);
      return publicURL; // Make sure to return the URL
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error; // Re-throw the error to be caught by the caller
    }
  };

  const sendLinkToBackEnd = async (firebase_link, isLogo = true) => {
    console.log("donneur Id: " + donneurID);
    try {
      const body = JSON.stringify({
        firebase_link: firebase_link,
        user_id: donneurID,
      });

      // Choose the correct endpoint based on whether it's a logo or banner
      const endpoint = isLogo ? 'set_logo' : 'set_banner';
      console.log(`Sending to backend: ${endpoint}`, body);

      const response = await fetch(`${BACKEND_URL}/media/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "remove-later",
        },
        body: body,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Backend error response:", responseText);
        throw new Error(`Failed to send link: ${response.status}`);
      }

      console.log(`Successfully sent to backend (${endpoint})`);
    } catch (error) {
      console.error(`Error in sendLinkToBackEnd:`, error);
      throw error;
    }
  };

  const pickImage = async (setImage, aspect = [1, 1], isLogo = true) => {
    try {
      // Use the correct API for MediaTypeOptions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photos to upload an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Using MediaTypeOptions as it's still available in your version
        allowsEditing: true,
        aspect: aspect,
        quality: 0.8,
      });

      if (!result.canceled) {
        // Update UI immediately with local image
        setImage(result.assets[0].uri);

        // Upload image to server
        setIsLoading(true);
        try {
          // Upload photo to Firebase Storage
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();

          // Pass the isLogo flag to the uploadImage function
          const imageUrl = await uploadImage(blob, isLogo);
          console.log(`Upload complete (${isLogo ? 'logo' : 'banner'}), URL:`, imageUrl);

          Alert.alert("Success", `${isLogo ? 'Logo' : 'Banner'} uploaded successfully`);
        } catch (error) {
          console.error(`Error uploading ${isLogo ? 'logo' : 'banner'}:`, error);
          Alert.alert(
            "Upload Error",
            `Failed to upload ${isLogo ? 'logo' : 'banner'}: ${error.message}. Please try again.`
          );
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error in pickImage:", error);
      Alert.alert("Error", `Image picker error: ${error.message}`);
    }
  };

  const saveProfileData = async () => {
    setIsLoading(true);
    try {
      // Prepare the data to send
      const organizationData = {
        name,
        description,
        address: {
          street: address,
          city,
          state,
          postalcode
        },
        phone: phoneNumber,
        max_occupancy: parseInt(maxOccupancy, 10) || 0,
        current_occupancy: parseInt(currentOccupancy, 10) || 0,
        is_24_hours: is24Hours,
        user_id: donneurID
      };

      console.log("Saving organization data:", organizationData);

      // Make the API call to update the organization
      const response = await fetch(`${BACKEND_URL}/organization/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "remove-later",
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update organization:", errorText);
        throw new Error("Failed to update organization");
      }

      console.log("Organization data updated successfully");
      Alert.alert(
        "Profile Updated",
        "Your changes have been saved successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error saving profile data:", error);
      Alert.alert(
        "Error",
        "Failed to save profile data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    Alert.alert(
      "Save Changes",
      "Are you sure you want to save these changes?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: saveProfileData
        },
      ]
    );
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading organization data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Uploading image...</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveHeaderButton}
          >
            <Text style={styles.saveHeaderButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Image Section */}
        <View style={styles.imageSection}>
          {/* Banner */}
          <TouchableOpacity
            style={styles.bannerContainer}
            onPress={() => pickImage(setBanner, [3, 1], false)}
          >
            <Image source={{ uri: banner }} style={styles.banner} />
            <View style={styles.bannerOverlay}>
              <Icon name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.changeImageText}>Change Banner</Text>
            </View>
          </TouchableOpacity>

          {/* Profile Pic */}
          <TouchableOpacity
            style={styles.profilePicContainer}
            onPress={() => pickImage(setProfilePic, [1, 1], true)}
          >
            <Image source={{ uri: profilePic }} style={styles.profilePic} />
            <View style={styles.profilePicOverlay}>
              <Icon name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Basic Info Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Text style={styles.label}>Organization Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter organization name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Describe your organization"
            />
          </View>

          {/* Contact Information Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter street address"
            />

            <View style={styles.rowInputs}>
              <View style={styles.rowInput}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                />
              </View>

              <View style={styles.rowInput}>
                <Text style={styles.label}>Province</Text>
                <TextInput
                  style={styles.input}
                  value={province}
                  onChangeText={setProvince}
                  placeholder="Province"
                />
              </View>
            </View>


            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={zip}
              onChangeText={setZip}
              placeholder="Enter postal code"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Capacity Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Capacity Information</Text>

            <Text style={styles.label}>Maximum Occupancy</Text>
            <TextInput
              style={styles.input}
              value={maxOccupancy}
              onChangeText={setMaxOccupancy}
              placeholder="Enter maximum capacity"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Current Occupancy</Text>
            <TextInput
              style={styles.input}
              value={currentOccupancy}
              onChangeText={setCurrentOccupancy}
              placeholder="Enter current occupancy"
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>24/7 Operation</Text>
              <Switch
                value={is24Hours}
                onValueChange={setIs24Hours}
                trackColor={{ false: "#767577", true: "#4A90E2" }}
                thumbColor="#f4f3f4"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1000,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  backButton: {
    padding: 5,
  },
  saveHeaderButton: {
    padding: 5,
  },
  saveHeaderButtonText: {
    color: "#4A90E2",
    fontWeight: "bold",
    fontSize: 16,
  },
  imageSection: {
    marginBottom: 15,
  },
  bannerContainer: {},
  banner: {
    width: "100%",
    height: 150,
    backgroundColor: "#ACACAC",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicContainer: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeImageText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontWeight: "600",
  },
  formContainer: {
    marginTop: 65,
    paddingHorizontal: 20,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#222222",
  },
  label: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowInput: {
    width: "48%",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  switchLabel: {
    fontSize: 16,
    color: "#222222",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
});