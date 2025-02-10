import React, { useState } from 'react';
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

// Example placeholders for an organization
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

// Example placeholders for a person
const examplePerson = {
  type: 'person',
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Passionate traveler, coffee enthusiast, and tech geek.',
  balance: 42,
  age: 30,
  location: 'Toronto, ON',
  banner: 'https://via.placeholder.com/600x200.png',
  picture: 'https://via.placeholder.com/100.png',
};

export default function ProfileScreen() {
  // Toggle state between person and organization
  const [profileData, setProfileData] = useState(exampleOrg);
  const isOrg = profileData.type === 'organization';
  const router = useRouter();

  // Open in Maps (or handle location logic)
  const handleOpenInMaps = () => {
    if (!isOrg) return;
    const org = profileData;
    const query = encodeURIComponent(`${org.address}, ${org.city}, ${org.province} ${org.zip}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
    });
  };

  const handleSendMoney = () => {
    router.push('/send-money');
  };

  const handleSendMessage = () => {
    router.push('/send-message');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <Image source={{ uri: profileData.banner }} style={styles.banner} />

      {/* Profile Picture */}
      <View style={styles.profilePicWrapper}>
        <Image
          source={{
            uri: isOrg ? profileData.logo : profileData.picture,
          }}
          style={styles.profilePic}
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.name}>
          {isOrg ? profileData.name : `${profileData.firstName} ${profileData.lastName}`}
        </Text>

        {/* Description / Bio */}
        <Text style={styles.description}>
          {isOrg ? profileData.description : profileData.bio}
        </Text>

        {isOrg ? (
          <View>
            {/* Max Occupancy Badge */}
            <View style={styles.occupancyBadge}>
              <Text style={styles.occupancyText}>
                Max Occupancy: {profileData.maxOccupancy}
              </Text>
            </View>

            {/* Address Section */}
            <View style={styles.addressSection}>
              <View style={styles.addressTextContainer}>
                <Text style={styles.sectionTitle}>Address</Text>
                <Text style={styles.infoLine}>
                  {profileData.address}, {profileData.city}, {profileData.province} {profileData.zip}
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
        ) : (
          <View>
            {/* Person's Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.infoLine}>{profileData.location}</Text>
            </View>

            {/* Person Info */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.lightBorder]}>
                <Text style={styles.statTitle}>Balance</Text>
                <Text style={styles.statValue}>${profileData.balance}</Text>
              </View>
              <View style={[styles.statCard, styles.lightBorder]}>
                <Text style={styles.statTitle}>Age</Text>
                <Text style={styles.statValue}>{profileData.age}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={[styles.section, styles.buttonSection]}>
              <TouchableOpacity style={styles.personButton} onPress={handleSendMoney}>
                <Text style={styles.personButtonText}>Send Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.personButton} onPress={handleSendMessage}>
                <Text style={styles.personButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Toggle Profile Type Button */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setProfileData(isOrg ? examplePerson : exampleOrg)}
        >
          <Text style={styles.buttonText}>Switch to {isOrg ? 'Person' : 'Organization'}</Text>
        </TouchableOpacity>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lightBorder: {
    borderColor: '#ddd',
    borderWidth: 1,
  },
  personButton: {
    flex: 1,
    backgroundColor: '#1DA1F2',
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  personButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  switchButton: {
    backgroundColor: '#1DA1F2',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
