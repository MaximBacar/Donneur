import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import OccupancyManager from "../../../components/OccupancyManager"; // Adjust path as needed

const orgData = {
  type: "organization",
  name: "CARE Montreal",
  description: "Shelter and food bank",
  maxOccupancy: 400,
  currentOccupancy: 250,
  address: "3674 Rue Ontario E",
  zip: "H1W 1R9",
  city: "Montréal",
  province: "Quebec",
  hoursOfOperation: "24/7",
  bedsAvailable: "200/400",
  logo: "https://via.placeholder.com/100/4A90E2/FFFFFF.png?text=CM",
  banner: "https://via.placeholder.com/600x200/ACACAC.png",
  phone: "No phone available",
};

export default function OrgProfileScreen() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState(orgData.logo);
  const [banner, setBanner] = useState(orgData.banner);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentOccupancy, setCurrentOccupancy] = useState(
    orgData.currentOccupancy
  );

  const handleOccupancyChange = (newOccupancy) => {
    setCurrentOccupancy(newOccupancy);
    // Here you would typically update your backend or storage
    // Example: updateShelterOccupancy(orgData.id, newOccupancy);

    // For demonstration, just show a toast or alert
    console.log(`Occupancy updated to ${newOccupancy}`);
  };

  const pickImage = async (setImage) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to upload an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const occupancyPercentage = (currentOccupancy / orgData.maxOccupancy) * 100;
  const occupancyColor =
    occupancyPercentage > 75
      ? "red"
      : occupancyPercentage > 50
      ? "orange"
      : "green";

  const handleEditProfile = () => {
    router.push("/(editProfile)");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => pickImage(setBanner)}>
        <ImageBackground source={{ uri: banner }} style={styles.heroImage}>
          <View style={styles.heroOverlay} />
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Icon name="pencil" size={18} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>CM</Text>
          </View>
        </View>
        <Text style={styles.shelterName}>{orgData.name}</Text>
        <Text style={styles.shelterSubtitle}>{orgData.description}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="bed" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {currentOccupancy}/{orgData.maxOccupancy}
            </Text>
            <Text style={styles.statLabel}>Beds Available</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#4A90E2"
            />
            <Text style={styles.statValue}>{orgData.hoursOfOperation}</Text>
            <Text style={styles.statLabel}>Open Hours</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color="#4A90E2"
            />
            <Text style={styles.statValue}>{"Montréal"}</Text>
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
            <Text style={styles.contactValue}>{orgData.address}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="phone" size={24} color="#4A90E2" />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{"No phone available"}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Occupancy Manager moved below contact information */}
        <View style={styles.occupancySection}>
          <OccupancyManager
            initialOccupancy={currentOccupancy}
            maxOccupancy={orgData.maxOccupancy}
            onOccupancyChange={handleOccupancyChange}
          />
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
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
  editButton: {
    position: "absolute",
    top: 20,
    right: 20,
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
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 5,
  },
  occupancySection: {
    marginTop: 30,
    marginBottom: 20,
  },
});
