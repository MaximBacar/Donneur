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
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, database } from '../../../../config/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useFriend } from './friendContext';
import { BACKEND_URL } from '../../../../constants/backend';
import { useAuth } from '../../../../context/authContext';
import { Colors } from '../../../../constants/colors';
export default function FriendProfile() {
  const { id } = useLocalSearchParams(); // Friend's UID
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const {friendProfile} = useFriend();
  const { token } = useAuth()

  const handleGoBack = () => {
    router.back();
  };
  
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
    ? `${friendProfile.picture_id}`
    : null;

    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
        
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
        {console.log(friendProfile)}
        <View style={styles.content}>
          <View style={styles.profileCard}>
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
                <LinearGradient
                  colors={['#0070BA', '#1546A0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.profileImage, styles.placeholder]}
                >
                  <FontAwesome5 name="user-alt" size={80} color="#FFFFFF" />
                </LinearGradient>
              )}
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.memberSince}>
              {console.log(friendProfile)}
              Friends since : {friendProfile.friends_since || '07-07-2002'}
            </Text>
          </View>
  
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            {/* Send Money Option */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/send/SendMoney?id=${friendProfile.id}`)}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name="paper-plane" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Send Money</Text>
                <Text style={styles.actionDescription}>
                  Send funds directly to {friendProfile.first_name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
            
            {/* Chat Option */}
            <TouchableOpacity
              style={styles.actionCard}
              // onPress={() => router.push('/inbox')}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Send Message</Text>
                <Text style={styles.actionDescription}>
                  Chat with {friendProfile.first_name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
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
              <LinearGradient
                colors={['#FF3B30', '#FF3B30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalIconContainer}
              >
                <FontAwesome5 
                  name="exclamation-triangle" 
                  size={30} 
                  color="white" 
                />
              </LinearGradient>
              <Text style={styles.modalTitle}>Remove Friend</Text>
              <Text style={styles.modalText}>
                Are you sure you want to remove {friendProfile.first_name} from your friend list?
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
                  <LinearGradient
                    colors={['#FF3B30', '#CC2F26']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalRemoveGradient}
                  >
                    <Text style={styles.modalRemoveText}>Remove</Text>
                  </LinearGradient>
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
      backgroundColor: '#F9F9F9',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#F9F9F9',
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
      padding: 24,
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
      backgroundColor: '#F9F9F9',
    },
    profileCard: {
      alignItems: 'center',
      marginBottom: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    imageWrapper: {
      width: 180,
      height: 180,
      borderRadius: 90,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    placeholder: {
      backgroundColor: '#0070BA',
      justifyContent: 'center',
      alignItems: 'center',
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
      fontSize: 24,
      fontWeight: '600',
      color: '#000',
      marginTop: 8,
    },
    memberSince: {
      fontSize: 14,
      color: '#666666',
      marginTop: 4,
    },
    actionsContainer: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    actionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    actionTextContainer: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 14,
      color: '#666666',
      lineHeight: 20,
    },
    
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 8,
    },
    modalText: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: '#F2F2F2',
      borderRadius: 12,
      paddingVertical: 14,
      marginRight: 8,
      alignItems: 'center',
    },
    modalCancelText: {
      color: '#666666',
      fontSize: 16,
      fontWeight: '600',
    },
    modalRemoveButton: {
      flex: 1,
      borderRadius: 12,
      marginLeft: 8,
      overflow: 'hidden',
    },
    modalRemoveGradient: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalRemoveText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });