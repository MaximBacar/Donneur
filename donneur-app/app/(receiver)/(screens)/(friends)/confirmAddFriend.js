import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import React from 'react'
import { useFriend } from './friendContext'
import { database } from '../../../../config/firebase'
import { useAuth } from '../../../../context/authContext'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { addDoc, collection } from 'firebase/firestore';
import { ActivityIndicator } from 'react-native'
export default function ConfirmAddFriend(){

    const {newFriendID, newFriendUID} = useFriend();
    const [friendData, setFriendData] = useState(null);
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);


    const [imageLoading, setImageLoading] = useState(true);
    
      useEffect(() => {
        console.log(newFriendUID);
        if (newFriendUID) {
          fetchUserData(newFriendUID);
        }
      }, [newFriendUID]);
    
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
    
    async function addFriend(){
        try {
            // For example, use the scanned encoded string to create a new friend request.
            const docRef = await addDoc(collection(database, 'friends'), {
              user1: user.uid,
              user2: newFriendUID, // This is the encoded string from your generated QR code.
              u1_accepted: true,
              u2_accepted: false,
            });
            console.log("Friend request created with ID:", docRef.id);
            Alert.alert("Success", "Friend request sent!");
            router.replace('(friends)/friends')
        } catch (error) {
          console.error("Error adding friend:", error);
          Alert.alert("Error", "Failed to send friend request.");
        } finally {
          setIsScanning(false);
        }
    }

    if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        );
      }
    
      if (!friendData) {
        return (
          <View style={styles.loadingContainer}>
            <Text>Could not load friend data.</Text>
          </View>
        );
      }
  return (
    <View style={styles.container}>
      {/* Header with Remove Button (including trash icon) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => addFriend()}
        >
          <Text style={styles.removeButtonText}>+Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.imageWrapper}>
            <Image
                source={{ uri: `https://api.donneur.ca/image/${friendData.picture_id}` }}
                style={styles.profileImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
        </View>
        <Text style={styles.displayName}>{`${friendData.first_name} ${friendData.last_name[0]}.`}</Text>
        <Text style={styles.memberSince}>
          Member since: {friendData.member_since || '07-07-2002'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#FFFFFF',
      padding: 16,
    },
    header: {
      alignItems: 'flex-end',
      marginBottom: 20,
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'black',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    trashIcon: {
      marginRight: 4,
    },
    removeButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileContainer: {
      alignItems: 'center',
      marginTop: 44,
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
  