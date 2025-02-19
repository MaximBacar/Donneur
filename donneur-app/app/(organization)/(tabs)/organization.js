import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

// Example placeholder for an organization
const exampleOrg = {
  type: 'organization',
  name: 'Example Org',
  description: 'An organization that does X, Y, and Z!',
  maxOccupancy: 100,
  address: '123 Elm Street',
  zip: 'A1A1A1',
  city: 'Montreal',
  province: 'QC',
  logo: 'https://via.placeholder.com/100/09f/fff.png',
  banner: 'https://via.placeholder.com/600x200.png',
};

export default function OrgProfileScreen() {
  const router = useRouter();

  // Open in Maps (or handle location logic)
  const handleOpenInMaps = () => {
    const org = exampleOrg;
    const query = encodeURIComponent(
      `${org.address}, ${org.city}, ${org.province} ${org.zip}`
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <Image source={{ uri: exampleOrg.banner }} style={styles.banner} />

      {/* Profile Picture */}
      <View style={styles.profilePicWrapper}>
        <Image source={{ uri: exampleOrg.logo }} style={styles.profilePic} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{exampleOrg.name}</Text>
        <Text style={styles.description}>{exampleOrg.description}</Text>

        {/* Occupancy Badge */}
        <View style={styles.occupancyBadge}>
          <Text style={styles.occupancyText}>
            Max Occupancy: {exampleOrg.maxOccupancy}
          </Text>
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressTextContainer}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.infoLine}>
              {exampleOrg.address}, {exampleOrg.city}, {exampleOrg.province}{' '}
              {exampleOrg.zip}
            </Text>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenInMaps}>
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <Text style={styles.infoLine}>No upcoming events yet!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const BANNER_HEIGHT = 100;
const PROFILE_PIC_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: '#ccc',
  },
  profilePicWrapper: {
    position: 'absolute',
    top: BANNER_HEIGHT - PROFILE_PIC_SIZE / 2,
    left: 20,
    borderRadius: PROFILE_PIC_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profilePic: {
    width: PROFILE_PIC_SIZE,
    height: PROFILE_PIC_SIZE,
    borderRadius: PROFILE_PIC_SIZE / 2,
    backgroundColor: '#eee',
  },
  content: {
    marginTop: PROFILE_PIC_SIZE / 2 + 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  name: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 5,
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  occupancyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFA500',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 15,
  },
  occupancyText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  addressSection: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoLine: {
    fontSize: 14,
    marginVertical: 2,
    color: '#333',
  },
  mapButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  section: {
    marginBottom: 15,
  },
});
