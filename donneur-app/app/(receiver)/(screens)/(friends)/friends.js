import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../../../context/authContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight, ZoomIn } from 'react-native-reanimated';

// Import UI components and constants
import IconSymbol from "../../../../components/ui/IconSymbol";
import { Colors } from "../../../../constants/colors";

// Import your Firebase config
import { auth, database } from '../../../../config/firebase';
// Import the custom avatar component
import { AvatarWithLoading } from './AvatarWithLoading';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'

  const { user } = useAuth();

  // Handle refresh
  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await loadFriends(user.uid);
    setRefreshing(false);
  }, [user]);

  // Load friends on component mount
  useEffect(() => {
    if (user) {
      loadFriends(user.uid);
    } else {
      setLoading(false);
    }
  }, [user]);

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
      <SafeAreaView style={[styles.loadingContainer, {paddingTop: insets.top}]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Animated.View entering={FadeIn.duration(600)}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={FadeInDown.duration(500).springify()}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("./addFriend")}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Tabs */}
      <Animated.View 
        style={styles.tabsContainer}
        entering={FadeInDown.delay(100).duration(500).springify()}
      >
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'friends' && styles.activeTab
          ]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'friends' && styles.activeTabText
          ]}>
            My Friends
            {myFriends.length > 0 && ` (${myFriends.length})`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'requests' && styles.activeTab
          ]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'requests' && styles.activeTabText
          ]}>
            Requests
            {pendingRequests.length > 0 && ` (${pendingRequests.length})`}
          </Text>
          {pendingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.light.tint]} 
          />
        }
      >
        {/* Friends List Tab */}
        {activeTab === 'friends' && (
          <Animated.View 
            style={styles.tabContent}
            entering={FadeIn.duration(300)}
          >
            {myFriends.length > 0 ? (
              myFriends.map((friend, index) => (
                <Animated.View 
                  key={friend.id}
                  entering={SlideInRight.delay(index * 50).duration(300)}
                >
                  <TouchableOpacity
                    style={styles.friendCard}
                    onPress={() => router.replace(`./${friend.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.friendAvatarContainer}>
                      {friend.picture ? (
                        <AvatarWithLoading
                          uri={friend.picture}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarInitial}>
                            {friend.name.charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendNote}>Friend</Text>
                    </View>
                    
                    <View style={styles.friendActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="chatbubble-outline" 
                          size={22} 
                          color={Colors.light.icon} 
                        />
                      </TouchableOpacity>
                      
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={Colors.light.icon} 
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Animated.View entering={ZoomIn.duration(500)}>
                  <Ionicons 
                    name="people-outline" 
                    size={64} 
                    color={Colors.light.icon}
                  />
                </Animated.View>
                <Text style={styles.emptyStateTitle}>No friends yet</Text>
                <Text style={styles.emptyStateText}>
                  Add new friends to see them here
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push("./addFriend")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyStateButtonText}>
                    Add New Friends
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}
        
        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <Animated.View 
            style={styles.tabContent}
            entering={FadeIn.duration(300)}
          >
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request, index) => (
                <Animated.View 
                  key={request.docId}
                  entering={SlideInRight.delay(index * 50).duration(300)}
                >
                  <View style={styles.requestCard}>
                    <View style={styles.requestMain}>
                      <View style={styles.friendAvatarContainer}>
                        {request.picture ? (
                          <AvatarWithLoading
                            uri={request.picture}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>
                              {request.name.charAt(0)}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.requestInfo}>
                        <Text style={styles.friendName}>{request.name}</Text>
                        <Text style={styles.friendNote}>
                          wants to be your friend
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.requestActions}>
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => denyRequest(request.docId)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="close" 
                          size={22} 
                          color={Colors.light.text} 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.acceptRequestButton}
                        onPress={() => acceptRequest(request.docId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.acceptRequestButtonText}>
                          Accept
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Animated.View entering={ZoomIn.duration(500)}>
                  <Ionicons 
                    name="mail-unread-outline" 
                    size={64} 
                    color={Colors.light.icon}
                  />
                </Animated.View>
                <Text style={styles.emptyStateTitle}>No pending requests</Text>
                <Text style={styles.emptyStateText}>
                  When someone adds you as a friend, you'll see their request here
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
  
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
    borderBottomColor: '#F2F2F2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 4,
    position: 'relative',
  },
  activeTab: {
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.icon,
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Friends Cards
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  friendAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F6F8FA',
    overflow: 'hidden',
    marginRight: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.icon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  friendNote: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  
  // Request Cards
  requestCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  requestMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  acceptRequestButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptRequestButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.light.icon,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
