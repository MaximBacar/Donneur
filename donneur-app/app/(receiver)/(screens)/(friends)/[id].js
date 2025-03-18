import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { auth, database } from '../../../../config/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFriend } from './friendContext';
import { BACKEND_URL } from '../../../../constants/backend';
import { useAuth } from '../../../../context/authContext';
export default function FriendProfile() {
  const { friend_db_id } = useLocalSearchParams(); // Friend's UID
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { friendProfile } = useFriend();

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const { token } = useAuth()

  const handleGoBack = () => {
    router.back();
  };
  async function fetchUserData(uid) {
    try {
      const res = await fetch(`https://api.donneur.ca/get_user?uid=${uid}`);
      const data = await res.json();
      setFriendData(data);
    } catch (err) {
      console.error('Error fetching friend data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFriend() {
    try {
      
      let url = `${BACKEND_URL}/friend/remove`;
      
      const payload = {
        'friendship_id': friendProfile.friendship_id,
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        },
        body: JSON.stringify(payload)
      });
      router.back();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!friendProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Could not load friend data.</Text>
      </View>
    );
  }

  // Format name: first name + first letter of last name (if exists)
  const displayName = `${friendProfile.first_name} ${friendProfile.last_name[0]}.`;

  // Build the profile picture URL (if available)
  const pictureUrl = friendProfile.picture_id 
    ? `${BACKEND_URL}/image/${friendProfile.picture_id}`
    : null;

    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friend Profile</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={18} color="red" style={styles.trashIcon} />
          </TouchableOpacity>
        </View>
  
        <View style={styles.content}>
          <View style={styles.profileContainer}>
            <View style={styles.imageWrapper}>
              {pictureUrl ? (
                <>
                  {imageLoading && (
                    <ActivityIndicator
                      style={styles.imageLoading}
                      size="large"
                      color="#000"
                    />
                  )}
                  <Image
                    source={{ uri: pictureUrl }}
                    style={styles.profileImage}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                  />
                </>
              ) : (
                <View style={[styles.profileImage, styles.placeholder]} />
              )}
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.memberSince}>
              Member since: {friendData.member_since || '07-07-2002'}
            </Text>
          </View>
  
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.balanceButton}
              onPress={() => router.push(`/send/SendMoney?friend_db_id=${friend_db_id}`)}
            >
              <Ionicons
                name="paper-plane-outline"
                size={20}
                color="#222222"
                style={styles.buttonIcon}
              />
              <Text style={styles.balanceButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.balanceButton}
              // onPress={() => router.push('/inbox')}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#222222"
                style={styles.buttonIcon}
              />
              <Text style={styles.balanceButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Remove Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <FontAwesome5 
                name="exclamation-triangle" 
                size={30} 
                color="red" 
                style={styles.modalIcon} 
              />
              <Text style={styles.modalText}>
                Are you sure you want to remove {friendData.first_name} from your friend list?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalRemoveButton}
                  onPress={async () => {
                    await removeFriend();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalRemoveText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#FFFFFF',
    },
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
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000000',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    removeButton: {
      padding: 8,
    },
    trashIcon: {
      marginRight: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileContainer: {
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 20,
    },
    imageWrapper: {
      width: 240,
      height: 240,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    placeholder: {
      backgroundColor: '#ccc',
    },
    imageLoading: {
      position: 'absolute',
      zIndex: 1,
      top: '50%',
      left: '50%',
      marginLeft: -12,
      marginTop: -12,
    },
    displayName: {
      fontSize: 22,
      fontWeight: '600',
      color: '#000',
      marginTop: 36,
    },
    memberSince: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    balanceButton: {
      backgroundColor: '#FFF',
      paddingHorizontal: 48,
      paddingVertical: 12,
      borderRadius: 32,
      marginHorizontal: 16,
      marginTop: 64,
      borderWidth: 1,
      borderColor: '#989898',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    balanceButtonText: {
      fontSize: 14,
      color: '#222222',
      fontWeight: '600',
      textAlign: 'center',
    },
    buttonIcon: {
      marginRight: 6,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    modalIcon: {
      marginBottom: 12,
    },
    modalText: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 8,
      paddingVertical: 10,
      marginRight: 8,
      alignItems: 'center',
    },
    modalCancelText: {
      color: 'gray',
      fontSize: 14,
      fontWeight: '600',
    },
    modalRemoveButton: {
      flex: 1,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: 'red',
      borderRadius: 8,
      paddingVertical: 10,
      marginLeft: 8,
      alignItems: 'center',
    },
    modalRemoveText: {
      color: 'red',
      fontSize: 14,
      fontWeight: '600',
    },
  });