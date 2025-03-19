import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../../../../context/authContext";

export default function OtherUserProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = params; // Get the userId from URL params
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`https://api.donneur.ca/get_user?uid=${userId}`);
        const data = await res.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Failed to load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    } else {
      setLoading(false);
      Alert.alert("Error", "User ID not provided");
    }
  }, [userId]);

  // Fallback example data if loading or no user data
  const examplePerson = {
    type: 'person',
    first_name: 'Jane',
    last_name: 'Smith',
    bio: 'Digital nomad and coffee connoisseur. Passionate about helping communities.',
    age: 28,
    location: 'Montreal, QC',
    banner: 'https://via.placeholder.com/600x200.png',
    creation_date: '2022-06-15',
    interests: ['Volunteering', 'Cooking', 'Hiking'],
    activity: [
      { type: 'payment', amount: 20, date: '3 days ago', recipient: 'Local Shelter' },
      { type: 'payment', amount: 15, date: '2 weeks ago', recipient: 'Food Bank' },
    ]
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  // Use profile data if available, otherwise use example data
  const userData = profileData || examplePerson;

  // Get initials from first and last name
  const getInitials = () => {
    return `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`;
  };

  // Format full name
  const fullName = `${userData.first_name} ${userData.last_name}`;

  // Get member since date
  const memberSince = new Date(userData.creation_date).toLocaleDateString();

  const handleSendMoney = () => {
    router.push({
      pathname: '/send-money',
      params: { recipientId: userId, recipientName: fullName }
    });
  };

  const handleSendMessage = () => {
    router.push({
      pathname: '/send-message',
      params: { recipientId: userId, recipientName: fullName }
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Header with Banner */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: userData.banner || 'https://via.placeholder.com/600x200.png' }} style={styles.banner} />
        
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
            {' '}{userData.location || 'Location not provided'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{userData.bio || 'No bio provided'}</Text>
          <Text style={styles.memberSince}>Member since {memberSince}</Text>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.age || '—'}</Text>
            <Text style={styles.statTitle}>Age</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.interests ? userData.interests.length : '0'}</Text>
            <Text style={styles.statTitle}>Interests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statTitle}>Donations</Text>
          </View>
        </View>
        
        {/* Interests */}
        {userData.interests && userData.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {userData.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Recent Activity (if shared) */}
        {userData.activity && userData.activity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {userData.activity.map((item, index) => (
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
        )}
        
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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