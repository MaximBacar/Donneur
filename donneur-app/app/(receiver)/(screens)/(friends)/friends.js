import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../../../context/authContext';

// Import your Firebase config
import { auth, database } from '../../../../config/firebase';
// Import the custom avatar component
import { AvatarWithLoading } from './AvatarWithLoading'; // Adjust the path as needed

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FriendsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    console.log("tttt");
    console.log(user);
    if (user) {
      console.log(user);
      loadFriends(user.uid);
    }

    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     loadFriends(user.uid);
    //   } else {
    //     setLoading(false);
    //     console.log("No user is logged in. Firestore read won't work.");
    //   }
    // });
    // return unsubscribe;
  }, []);

  async function loadFriends(currentUid) {
    setLoading(true);
    try {
      const friendsRef = collection(database, 'friends');
      const q1 = query(friendsRef, where('user1', '==', currentUid));
      const q2 = query(friendsRef, where('user2', '==', currentUid));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      let allDocs = [];
      snap1.forEach((doc) => {
        allDocs.push({ id: doc.id, ...doc.data() });
      });
      snap2.forEach((doc) => {
        allDocs.push({ id: doc.id, ...doc.data() });
      });

      // Remove duplicates
      const uniqueDocs = [
        ...new Map(allDocs.map((item) => [item.id, item])).values(),
      ];

      // Separate accepted from pending:
      // For pending, only show if for the current user the accepted flag is false and the OTHER user's flag is true.
      const acceptedDocs = [];
      const pendingDocs = [];
      uniqueDocs.forEach((doc) => {
        if (doc.user1 === currentUid) {
          if (doc.u1_accepted && doc.u2_accepted) {
            acceptedDocs.push(doc);
          } else if (!doc.u1_accepted && doc.u2_accepted) {
            pendingDocs.push(doc);
          }
        } else if (doc.user2 === currentUid) {
          if (doc.u1_accepted && doc.u2_accepted) {
            acceptedDocs.push(doc);
          } else if (doc.u1_accepted && !doc.u2_accepted) {
            pendingDocs.push(doc);
          }
        }
      });

      // For accepted docs, fetch user info for the "other" user
      const acceptedPromises = acceptedDocs.map(async (doc) => {
        const friendUid = doc.user1 === currentUid ? doc.user2 : doc.user1;
        const res = await fetch(`https://api.donneur.ca/get_user?uid=${friendUid}`);
        const userData = await res.json();
        const pictureUrl = userData.picture_id 
          ? `https://api.donneur.ca/image/${userData.picture_id}`
          : null;
        return {
          id: friendUid,
          name: `${userData.first_name} ${userData.last_name}`,
          picture: pictureUrl,
          note: 'See profile.',
        };
      });
      const acceptedResults = await Promise.all(acceptedPromises);

      // For pending docs, fetch user info for the "other" user
      const pendingPromises = pendingDocs.map(async (doc) => {
        const friendUid = doc.user1 === currentUid ? doc.user2 : doc.user1;
        const res = await fetch(`https://api.donneur.ca/get_user?uid=${friendUid}`);
        const userData = await res.json();
        const pictureUrl = userData.picture_id 
          ? `https://api.donneur.ca/image/${userData.picture_id}`
          : null;
        return {
          docId: doc.id,
          friendUid,
          name: `${userData.first_name} ${userData.last_name}`,
          picture: pictureUrl,
          note: 'wants to be your friend',
        };
      });
      const pendingResults = await Promise.all(pendingPromises);

      setMyFriends(acceptedResults);
      setPendingRequests(pendingResults);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  }

  // Accept handler: update the friend relationship document and animate the state update.
  const acceptRequest = async (docId) => {
    try {
      const friendDocRef = doc(database, 'friends', docId);
      await updateDoc(friendDocRef, {
        u1_accepted: true,
        u2_accepted: true,
      });
      console.log('Friend request accepted');

      // Animate removal from pending list.
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Find the accepted request details from pendingRequests.
      const acceptedRequest = pendingRequests.find((req) => req.docId === docId);
      // Remove it from pending requests.
      setPendingRequests((prev) => prev.filter((req) => req.docId !== docId));
      // Optionally, add it to myFriends list with an animation.
      if (acceptedRequest) {
        setMyFriends((prev) => [...prev, {
          id: acceptedRequest.friendUid,
          name: acceptedRequest.name,
          picture: acceptedRequest.picture,
          note: 'See profile.',
        }]);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert("Error", "Failed to accept friend request.");
    }
  };

  // Deny handler: update the friend relationship document and animate removal.
  const denyRequest = async (docId) => {
    try {
      const friendDocRef = doc(database, 'friends', docId);
      await updateDoc(friendDocRef, {
        u1_accepted: false,
        u2_accepted: false,
      });
      console.log('Friend request denied');

      // Animate removal from pending list.
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPendingRequests((prev) => prev.filter((req) => req.docId !== docId));
    } catch (error) {
      console.error('Error denying friend request:', error);
      Alert.alert("Error", "Failed to deny friend request.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.subtitle}>Manage your friends</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("./addFriend")}
          >
            <Text style={styles.addButtonText}>Add friends</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <View key={request.docId} style={styles.requestItem}>
                <View style={styles.friendAvatar}>
                  {request.picture ? (
                    <AvatarWithLoading
                      uri={request.picture}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                </View>
                <Text style={styles.requestText}>
                  {request.name} {request.note}
                </Text>
                <View style={styles.requestButtons}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptRequest(request.docId)}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color="green"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.denyButton}
                    onPress={() => denyRequest(request.docId)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color="red"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noRequestsContainer}>
              <Ionicons
                name="mail-unread-outline"
                size={40}
                color="#999"
                style={styles.noRequestsIcon}
              />
              <Text style={styles.noRequestsText}>
                No requests at this time
              </Text>
            </View>
          )}
        </View>

        {/* My Friends */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My friends</Text>
          {myFriends.length > 0 ? (
            myFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendsButton}
                onPress={() => router.replace(`./${friend.id}`)}
              >
                <View style={styles.friendsButtonContent}>
                  <View style={styles.friendAvatar}>
                    {friend.picture ? (
                      <AvatarWithLoading
                        uri={friend.picture}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder} />
                    )}
                  </View>
                  <Text style={styles.friendsText}>{friend.name}</Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={24}
                    color="#007AFF"
                    style={styles.chevronIcon}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: "#666" }}>No accepted friends yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  noRequestsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noRequestsText: {
    color: '#999',
    fontSize: 14,
  },
  noRequestsIcon: {
    marginBottom: 8,
  },
  // Pending Requests & My Friends Items
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  requestText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  requestButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    marginRight: 12,
  },
  denyButton: {},
  // Friend card for My Friends
  friendsButton: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#989898',
    backgroundColor: '#FFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  friendsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  friendsText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 12,
    color: '#222',
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 8,
    color: '#222222',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#CCC',
  },
});
