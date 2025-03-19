import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Linking,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  updateMetadata,
} from "firebase/storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import OccupancyManager from "../../../components/OccupancyManager"; // Adjust path as needed
import { storage } from "../../../config/firebase";
import { BACKEND_URL } from "../../../constants/backend";
import { useAuth } from "../../../context/authContext";

export default function OrgProfileScreen() {
  const router = useRouter();
  const { user, token, donneurID, logout } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [banner, setBanner] = useState(null);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to generate a unique filename without using uuid
  const generateUniqueFilename = () => {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `image_${timestamp}_${randomStr}.png`;
  };

  // Fetch organization data for the current authenticated user
  useEffect(() => {
    const fetchOrgData = async () => {
      if (!donneurID) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const url = `${BACKEND_URL}/organization/get?id=${donneurID}`;
        console.log("Fetching organization data for user ID:", donneurID);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setShelter(data);
        setCurrentOccupancy(data.current_occupancy || 0);

        // Set banner using banner_file if available
        if (data.banner_file) {
          setBanner(data.banner_file);
        } else {
          setBanner("https://via.placeholder.com/600x200/ACACAC.png");
        }

        // Set profile pic
        if (data.logo_file) {
          setProfilePic(data.logo_file);
        } else {
          // Use placeholder for profile pic if logo_file is not available
          setProfilePic("https://via.placeholder.com/100/4A90E2/FFFFFF.png?text=CM");
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [donneurID]);

  const handleOccupancyChange = (newOccupancy) => {
    // Update local state immediately for UI responsiveness
    setCurrentOccupancy(newOccupancy);
    console.log(`Occupancy updated to ${newOccupancy}`);
    
    // Here you would typically update your backend with the new occupancy
    if (shelter && shelter._id) {
      // Example API call (uncomment and modify when ready to implement):
      /*
      fetch(`${BACKEND_URL}/organization/update-occupancy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: shelter._id,
          currentOccupancy: newOccupancy
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update occupancy');
        return response.json();
      })
      .then(data => {
        console.log('Occupancy updated successfully');
      })
      .catch(error => {
        console.error('Error updating occupancy:', error);
        // Optionally revert the UI if the API call fails
        // setCurrentOccupancy(shelter.current_occupancy);
      });
      */
    }
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
      
      // If successfully uploaded, refresh the UI
      if (isLogo) {
        setProfilePic(firebase_link);
      } else {
        setBanner(firebase_link);
      }
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

  const handleEditProfile = () => {
    router.push({
      pathname: "/(editProfile)",
      params: { id: donneurID },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            //logout();
            // Navigate to login page after logout
            router.replace("/(auth)/login");
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Get initials for logo
  const getInitials = () => {
    if (!shelter || !shelter.name) return "??";

    const words = shelter.name.split(" ");
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // Format address components
  const formatAddress = () => {
    if (!shelter || !shelter.address) return "Address not available";

    const { street, city, province, zip } = shelter.address;
    let formattedAddress = "";

    if (street) formattedAddress += street;
    if (city) formattedAddress += (formattedAddress ? ", " : "") + city;
    if (province) formattedAddress += (formattedAddress ? ", " : "") + province;
    if (zip) formattedAddress += (formattedAddress ? " " : "") + zip;

    return formattedAddress || "Address not available";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading organization profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color="#FF6B6B"
        />
        <Text style={styles.errorTitle}>Error loading profile</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Re-fetch data
            fetchOrgData();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate the occupancy percentage using the current value from state
  const occupancyPercentage =
    shelter && shelter.max_occupancy
      ? Math.round((currentOccupancy / shelter.max_occupancy) * 100)
      : 0;

  // Determine color based on occupancy
  const getOccupancyColor = (percentage) => {
    if (percentage < 50) return "#4CAF50"; // Green for low occupancy
    if (percentage < 80) return "#FFC107"; // Yellow for medium
    return "#FF5252"; // Red for high occupancy
  };

  const occupancyColor = getOccupancyColor(occupancyPercentage);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Uploading image...</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => pickImage(setBanner, [3, 1], false)}>
        <ImageBackground source={{ uri: banner }} style={styles.heroImage}>
          <View style={styles.heroOverlay}>
            {/* Camera icon removed */}
          </View>
        </ImageBackground>
      </TouchableOpacity>

      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Icon name="pencil" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => pickImage(setProfilePic, [1, 1], true)}
        >
          {profilePic ? (
            <View style={styles.logoImageContainer}>
              <Image source={{ uri: profilePic }} style={styles.logoImage} />
              {/* Camera icon removed */}
            </View>
          ) : (
            <View style={styles.logo}>
              <Text style={styles.logoText}>{getInitials()}</Text>
              {/* Camera icon removed */}
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.shelterName}>
          {shelter?.name || "Organization Name"}
        </Text>
        <Text style={styles.shelterSubtitle}>
          {shelter?.description || "No description available"}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="bed" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {currentOccupancy || 0}/{shelter?.max_occupancy || "?"}
            </Text>
            <Text style={styles.statLabel}>Beds Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#4A90E2"
            />
            <Text style={styles.statValue}>{shelter?.hours || "24/7"}</Text>
            <Text style={styles.statLabel}>Open Hours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#4A90E2"
            />
            <Text style={styles.statValue}>
              {shelter?.address?.city || "City"}
            </Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#4A90E2"
            />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>{formatAddress()}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="phone" size={24} color="#4A90E2" />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>
                {shelter?.phone || "No phone available"}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
          {shelter?.email && (
            <TouchableOpacity style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={24} color="#4A90E2" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{shelter.email}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Add the Occupancy Manager Component */}
        <View style={styles.occupancySection}>
          <Text style={styles.sectionTitle}>Manage Occupancy</Text>
          {shelter?.max_occupancy && (
            <OccupancyManager
              initialOccupancy={currentOccupancy}
              maxOccupancy={shelter.max_occupancy}
              onOccupancyChange={handleOccupancyChange}
            />
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButtonContainer} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {shelter?.max_occupancy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Occupancy</Text>
            <View style={styles.occupancyContainer}>
              <View
                style={[
                  styles.occupancyCircle,
                  { backgroundColor: occupancyColor },
                ]}
              >
                <Text style={styles.occupancyPercentage}>
                  {occupancyPercentage}%
                </Text>
                <Text style={styles.occupancyLabel}>Occupied</Text>
              </View>
              <View style={styles.occupancyStats}>
                <View style={styles.occupancyStat}>
                  <Text style={styles.occupancyStatValue}>
                    {currentOccupancy || "0"}
                  </Text>
                  <Text style={styles.occupancyStatLabel}>Current</Text>
                </View>
                <View style={styles.occupancyStatDivider} />
                <View style={styles.occupancyStat}>
                  <Text style={styles.occupancyStatValue}>
                    {shelter.max_occupancy}
                  </Text>
                  <Text style={styles.occupancyStatLabel}>Maximum</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Additional Info Section (if available) */}
        {shelter?.additional_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{shelter.additional_info}</Text>
            </View>
          </View>
        )}

        {/* Debug Section - Keep this for development */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Information</Text>
          <View style={styles.debugContainer}>
            <Text style={styles.debugHeader}>Available Organization Data:</Text>
            <View style={styles.idDebugContainer}>
              <Text style={styles.debugLabel}>User UID:</Text>
              <Text style={styles.debugValue}>
                {user?.uid || "Not available"}
              </Text>
            </View>
            <View style={styles.idDebugContainer}>
              <Text style={styles.debugLabel}>Donneur ID:</Text>
              <Text style={styles.debugValue}>
                {donneurID || "Not available"}
              </Text>
            </View>
            {shelter && shelter._id && (
              <View style={styles.idDebugContainer}>
                <Text style={styles.debugLabel}>Organization ID:</Text>
                <Text style={styles.debugValue}>{shelter._id}</Text>
              </View>
            )}
            <ScrollView style={styles.debugScrollView}>
              <Text style={styles.debugText}>
                {JSON.stringify(shelter, null, 2)}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log("Full organization data:", shelter);
                console.log("Organization ID:", shelter?._id);
                console.log("User UID:", user?.uid);
                console.log("Donneur ID:", donneurID);
                Alert.alert(
                  "Data Logged",
                  "Full organization data has been logged to the console"
                );
              }}
            >
              <Text style={styles.debugButtonText}>Log Data to Console</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
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
    marginTop: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#FF6B6B",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    color: "#666",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  heroImage: {
    height: 200,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  editButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginRight: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 5,
  },
  logoutButtonContainer: {
    backgroundColor: "#FF5252",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  bannerImageIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  changeImageText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
  },
  followingButton: {
    backgroundColor: "#FFF",
  },
  followButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  followingButtonText: {
    color: "#4A90E2",
  },
  profileContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: -50,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
  },
  logoImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFF",
    overflow: "hidden",
    position: "relative",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    color: "#FFF",
    fontWeight: "bold",
  },
  shelterName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  shelterSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#DDD",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: "#666",
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  occupancyContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  occupancyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  occupancyPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  occupancyLabel: {
    fontSize: 14,
    color: "#FFF",
  },
  occupancyStats: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  occupancyStat: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  occupancyStatValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  occupancyStatLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  occupancyStatDivider: {
    width: 1,
    backgroundColor: "#DDD",
    marginHorizontal: 16,
  },
  occupancySection: {
    marginTop: 30,
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  directionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  directionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  bannerImageIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  changeImageText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontWeight: "600",
  },
  debugContainer: {
    padding: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  debugHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  idDebugContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  debugLabel: {
    fontWeight: "bold",
    marginRight: 8,
    color: "#555",
  },
  debugValue: {
    color: "#333",
    fontFamily: "monospace",
  },
  debugScrollView: {
    maxHeight: 300,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
    marginTop: 8,
  },
  debugText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
  },
  debugButton: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  debugButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});