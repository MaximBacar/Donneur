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
import { BACKEND_URL } from '../../../../constants/backend';
export default function ConfirmAddFriend(){

    const {newFriendID, setNewFriendID} = useFriend();
    const [friendData, setFriendData] = useState(null);
    const { user, token } = useAuth();
    const router = useRouter();
    const { fromFriends } = router.params || {};
    const [loading, setLoading] = useState(true);
    const [imageLoading,setImageLoading] = useState(false);
    const [boxSize, setBoxSize] = useState(0);
    
    useEffect(() => {
      if (newFriendID) {
        fetchUserData(newFriendID);
      }
    }, [newFriendID]);
    
    const fetchUserData = async (id) => {
      try {
        let url = `${BACKEND_URL}/receiver/profile?receiver_id=${id}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning' : 'remove-later'
          }
        });
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        setFriendData(data);

      } catch (err) {
        console.error('Error fetching friend data:', err);
        Alert.alert('Error', 'Could not load friend data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    const cancel = () => {
      // Also clear the friend ID when canceling
      setNewFriendID(null);
      if (fromFriends) {
        router.replace('(screens)/(friends)/friends');
      } else {
        router.replace('/');
      }
    }
    
    const addFriend = async () =>{
      try {
          let url = `${BACKEND_URL}/friend/add`;
          const body = {
            'friend_id' : newFriendID
          }
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning' : 'remove-later'
            },
            body:JSON.stringify(body)
          });
          const data = await response.json();
          
          // Clear the newFriendID from context
          setNewFriendID(null);
                
          Alert.alert("Success", "Friend request sent!");
          if (fromFriends) {
            router.replace('(screens)/(friends)/friends');
          } else {
            router.replace('/');
          }
      } catch (error) {
        console.error("Error adding friend:", error);
        Alert.alert("Error", "Failed to send friend request.");
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
      <View style={styles.content}>
        <View style={styles.profileContainer} onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setBoxSize(width); // Set height equal to parent width
      }}>
          <View style={[styles.imageWrapper, { height: boxSize }]}>
              <Image
                  source={{ uri: `${friendData.picture_id}` }}
                  style={styles.profileImage}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
          </View>
          <Text style={styles.displayName}>{`${friendData.name}`}</Text>
          <Text style={styles.memberSince}>
            Member since: {friendData.member_since || 'N/A'}
          </Text>
        </View>
        <View style={styles.header}>
          <TouchableOpacity style={styles.removeButton} onPress={() => addFriend()} >
            <Text style={styles.removeButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={() => cancel()} >
            <Text style={styles.removeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#FFFFFF',
      padding: 16,
      alignItems: 'center'
      
    },
    content:{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80%',
      height:'100%'
    },
    header: {
      alignItems: 'center',
      justifyContent:'space-between',
      display: 'flex',
      flexDirection:'col',
      marginBottom: 20,
      width: '100%'
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'black',
      width:'100%',
      height:60,
      marginBottom:10,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
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
      display: 'flex',
      flexDirection:'column',
      width:'100%',
      alignItems: 'center',
      marginTop: 44,
      marginBottom: 20,
    },
    imageWrapper: {
      width: '100%',
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
  