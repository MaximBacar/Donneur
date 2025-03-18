import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../../../context/authContext";
import * as ImagePicker from 'expo-image-picker';

const exampleOrg = {
  banner: 'https://via.placeholder.com/600x200.png',
};
export default function PersonProfileScreen() {
  const { user, donneurID } = useAuth();
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const [banner, setBanner] = useState(exampleOrg.banner);
  const [userInfo, setUserInfo] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        try {
          const res = await fetch(`https://api.donneur.ca/get_user?uid=${user.uid}`);
          const data = await res.json();
          setUserInfo(data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setLoading(false);
        }
      };

      const fetchBalance = async () => {
        try {
          const res = await fetch(`https://api.donneur.ca/get_balance/${donneurID}`);
          const data = await res.json();
          setUserBalance(data.balance);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      };

      fetchUserInfo();
      fetchBalance();
    }
  }, [user]);

  // Fallback to example data if loading or no user data
  const examplePerson = {
    type: 'person',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Passionate traveler, coffee enthusiast, and tech geek.',
    balance: 42,
    age: 30,
    location: 'Toronto, ON',
    banner: 'https://via.placeholder.com/600x200.png',
    memberSince: 'March 2022',
    interests: ['Travel', 'Photography', 'Technology'],
    activity: [
      { type: 'payment', amount: 15, date: '2 days ago', recipient: 'Sarah M.' },
      { type: 'payment', amount: 28, date: '1 week ago', recipient: 'David K.' },
    ]
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  // Get initials from first and last name
  const getInitials = () => {
    if (userInfo) {
      return `${userInfo.first_name.charAt(0)}${userInfo.last_name.charAt(0)}`;
    }
    return `${examplePerson.firstName.charAt(0)}${examplePerson.lastName.charAt(0)}`;
  };

  // Format full name
  const fullName = userInfo 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : `${examplePerson.firstName} ${examplePerson.lastName}`;

  // Get member since date
  const memberSince = userInfo 
    ? new Date(userInfo.creation_date).toLocaleDateString() 
    : examplePerson.memberSince;

  const handleSendMoney = () => {
    router.push('/send-money');
  };

  const handleSendMessage = () => {
    router.push('/send-message');
  };

  const pickImage = async (setImage) => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to upload an image.');
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
  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Banner */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => pickImage(setBanner)}>
        <Image source={{ uri: banner }} style={styles.banner} />
        </TouchableOpacity>

        <View style={styles.headerBottom}>
          {/* Profile circle with initials */}
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{getInitials()}</Text>
          </View>
          
          {/* Full name displayed below */}
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{fullName}</Text>
          </View>
          
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#777" />
            {' '}{examplePerson.location}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{examplePerson.bio}</Text>
          <Text style={styles.memberSince}>Member since {memberSince}</Text>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${userBalance ? userBalance.toFixed(2) : examplePerson.balance}</Text>
            <Text style={styles.statTitle}>Balance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{examplePerson.age}</Text>
            <Text style={styles.statTitle}>Age</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{examplePerson.interests.length}</Text>
            <Text style={styles.statTitle}>Interests</Text>
          </View>
        </View>
        
        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {examplePerson.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {examplePerson.activity.map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Ionicons name="cash-outline" size={20} color="#1DA1F2" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>
                  Sent ${item.amount} to {item.recipient}
                </Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleSendMoney}
          >
            <Ionicons name="cash-outline" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleSendMessage}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#1DA1F2" />
            <Text style={styles.secondaryButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
        
        {/* Extra space at bottom for scrolling */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const BANNER_HEIGHT = 150;
const INITIALS_CIRCLE_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: '#ccc',
  },
  
  headerBottom: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  initialsCircle: {
    width: INITIALS_CIRCLE_SIZE,
    height: INITIALS_CIRCLE_SIZE,
    borderRadius: INITIALS_CIRCLE_SIZE / 2,
    backgroundColor: '#4F8EF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -INITIALS_CIRCLE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  nameContainer: {
    marginTop: 10,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    color: '#777',
    marginTop: 6,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  memberSince: {
    fontSize: 13,
    color: '#888',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  statTitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#edf7ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#1DA1F2',
    fontSize: 14,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#1DA1F2',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1DA1F2',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#1DA1F2',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
});