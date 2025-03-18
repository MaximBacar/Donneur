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
import { useSegments } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/authContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight, ZoomIn } from 'react-native-reanimated';

import { BACKEND_URL } from '../../../../constants/backend';




import { Colors } from "../../../../constants/colors";

// Import the custom avatar component
import { AvatarWithLoading } from './AvatarWithLoading';
import { useFriend } from './friendContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { setFriendProfile } = useFriend();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'

  const { user, token } = useAuth();
  
  const segments = useSegments();
  const currentPath = `/${segments.join('/')}`;

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, [user]);

  // Load friends on component mount
  useEffect(() => {
    loadFriends();
  }, [user]);

  const openFriendProfile = ( friend ) => {
    setFriendProfile(friend);
    router.push(`./${friend.id}`)
  }

  async function loadFriends() {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/friend/get`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      
      const data = await response.json();
      console.log(data);
      let friends = data.friends
      let requests = data.requests

      console.log(friends);
      console.log(currentPath);
      console.log(requests);

    

      setMyFriends(friends);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  }

  // Accept handler: update the friend relationship document and animate the state update.
  const replyRequest = async (friendship_id, accept) => {
    try {
      let url = `${BACKEND_URL}/friend/reply`;

      const payload = {
        'friendship_id': friendship_id,
        'accept' : accept
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

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert("Error", "Failed to accept friend request.");
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
                    onPress={() => openFriendProfile(friend)}
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
                            {friend.first_name.charAt(0)}{friend.last_name.charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.first_name} {friend.last_name}</Text>
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
                  Add new friends to see them here.
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
                              {request.first_name.charAt(0)} {request.last_name.charAt(0)}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.requestInfo}>
                        <Text style={styles.friendName}>{request.first_name} {request.last_name}</Text>
                        <Text style={styles.friendNote}>
                          wants to be your friend
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.requestActions}>
                      <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => replyRequest(request.friendship_id, false)}
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
                        onPress={() => replyRequest(request.friendship_id, true)}
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
