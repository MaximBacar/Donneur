import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './withdrawalContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IdConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);  // For loading state
  const [error, setError] = useState(null);      // For error handling

  const {userID, setBalance} = useUser();

  useEffect(() => {
    if (userID) {
      // Fetch data from API
      fetch(`https://api.donneur.ca/receiver/id_profile?receiver_id=${userID}`)
        .then((response) => response.json())
        .then((data) => {
          setUserData(data);  // Store fetched data
          setLoading(false);   // Set loading to false
          setBalance(data.balance);
        })
        .catch((err) => {
          setError(err.message); // Set error if the request fails
          setLoading(false);     // Set loading to false
        });
    }
  }, [userID]);  // Only fetch data if `userID` changes or is available

  const handleGoBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    console.log('Identity confirmed');
    // Navigate to withdrawalAmount.js
    router.push('/withdrawalAmount');
  };

  const handleRefuse = () => {
    console.log('Transaction refused');
    // Navigate to /(tabsOrg)/dashboard
    router.replace({
      pathname: '/(organization)/(tabs)',
      params: { refresh: Date.now() } // Force a refresh with unique param
    });
    };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
        
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ID Confirmation</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
        
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ID Confirmation</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ID Confirmation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Top portion (Title + Identity Info) */}
        <View>
          {/* Section Title */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.title}>ID Confirmation</Text>
            <Text style={styles.subtitle}>Confirm the identity for the withdrawal</Text>
          </View>

          {/* Identity Info */}
          <View style={styles.identityContainer}>
            <Image source={{ uri: userData.picture_url }} style={styles.profilePhoto} />
            <View style={styles.infoColumn}>
              <Text style={styles.name}>{userData.name}</Text>
              <Text style={styles.detail}>Date of birth: {userData.dob}</Text>
              <Text style={styles.detail}>{userID}</Text>
            </View>
          </View>
        </View>

        {/* Bottom portion (Prompt + Buttons) */}
        <View>
          <Text style={styles.prompt}>
            Confirm the identity of the user by asking for their government issued identification.
          </Text>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Identity</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRefuse}>
            <Text style={styles.refuseText}>Refuse Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between', // Splits top/bottom
    paddingBottom: 20,               // Extra spacing from bottom
    paddingHorizontal: 40,           // More padding on the sides
    paddingTop: 20,
  },
  // Section Title
  sectionTitleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  // Identity Info
  identityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 15,
    backgroundColor: '#ccc',
  },
  infoColumn: {
    flexShrink: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  // Prompt
  prompt: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    marginTop: 30, // Add some top spacing from identity info
  },
  // Confirm Button
  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Refuse Text
  refuseText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
