import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const userId = "uzS6R6ZwE7"; // Hardcoded user ID

  const handleViewProfile = () => {
    router.push({
      pathname: '/see_profile',
      params: { userId: userId }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={60} color="#1DA1F2" />
        </View>
        
        <Text style={styles.titleText}>View User Profile</Text>
        <Text style={styles.subtitleText}>
          Click the button below to view the user profile
        </Text>
        
        <TouchableOpacity 
          style={styles.viewProfileButton} 
          onPress={handleViewProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View Profile</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#edf7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  viewProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#1DA1F2',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});