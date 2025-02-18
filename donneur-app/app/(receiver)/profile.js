import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Example placeholder for a person
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

export default function PersonProfileScreen() {
  const router = useRouter();

  const handleSendMoney = () => {
    router.push('/send-money');
  };

  const handleSendMessage = () => {
    router.push('/send-message');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Banner */}
      <Image source={{ uri: examplePerson.banner }} style={styles.banner} />

      {/* Profile Picture */}
      <View style={styles.profilePicWrapper}>
        <Image source={{ uri: examplePerson.picture }} style={styles.profilePic} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.name}>
          {examplePerson.firstName} {examplePerson.lastName}
        </Text>
        <Text style={styles.description}>{examplePerson.bio}</Text>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.infoLine}>{examplePerson.location}</Text>
        </View>

        {/* Person Info */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.lightBorder]}>
            <Text style={styles.statTitle}>Balance</Text>
            <Text style={styles.statValue}>${examplePerson.balance}</Text>
          </View>
          <View style={[styles.statCard, styles.lightBorder]}>
            <Text style={styles.statTitle}>Age</Text>
            <Text style={styles.statValue}>{examplePerson.age}</Text>
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
  section: {
    marginBottom: 15,
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
  statTitle: {
    fontSize: 14,
    color: '#555',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
