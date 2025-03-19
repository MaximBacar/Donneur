import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useRouter } from "expo-router";
import { BACKEND_URL } from "../../../constants/backend";
import { useAuth } from "../../../context/authContext";
import {
  fetchPostsOnce,
  useDeletePost,
  useToggleLike,
  fetchUserPostsOnce,
} from "../(screens)/(feed)/postService";

// Firestore for partial real-time
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { database } from "../../../config/firebase";

const placeholderAvatar = { uri: "https://i.pravatar.cc/300" };

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, DonneurID } = useAuth();

  const [myPosts, setMyPosts]                 = useState([]);
  const [feedPosts, setFeedPosts]             = useState([]);
  const [refreshing, setRefreshing]           = useState(false);
  const [displayedPosts, setDisplayedPosts]   = useState([]);
  const [showOnlyMyPosts, setShowOnlyMyPosts] = useState(false);
  const [firstLoad, setFirstLoad]             = useState(false);
  

  // Animation for filter button
  const filterButtonScale = useState(new Animated.Value(1))[0];

  // Hooks for delete & like
  const removePost = useDeletePost();
  const toggleLike = useToggleLike();

  // "Who liked" modal
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [currentLikes, setCurrentLikes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!firstLoad) {
        await loadPosts();
        await loadUserPosts();
        setFirstLoad(true);
      }
    };
  
    fetchData();
  
  }, [firstLoad]);

  useEffect(() => {
    loadPosts();
    loadUserPosts();
  }, []);



  useEffect(() => {
    if (showOnlyMyPosts) {
      setDisplayedPosts(myPosts);
    } else {
      setDisplayedPosts(feedPosts);
    }
  }, [feedPosts, myPosts, showOnlyMyPosts]);


  
  const loadPosts = async () => {
    setRefreshing(true);
    try {
      let url = `${BACKEND_URL}/feed`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      const data = await response.json();
      console.log("feed : ",data)
      setFeedPosts(data.feed);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setRefreshing(false);
  };


  const loadUserPosts = async () => {
    setRefreshing(true);
    try {
      let url = `${BACKEND_URL}/feed/get_user_posts`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      
      const data = await response.json();
      console.log('datas :', data.posts)
      setMyPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setRefreshing(false);
  };

  // Pull-to-refresh
  const onRefresh = () => {
    if (showOnlyMyPosts) {
      loadUserPosts();
    } else {
      loadPosts();
    }
  };

  // Toggle filter for user posts
  const toggleMyPostsFilter = () => {
    // Animate the button press
    Animated.sequence([
      Animated.timing(filterButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(filterButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowOnlyMyPosts(!showOnlyMyPosts);
  };

  // ─────────────────────────────────────────────────────────
  // 3) DELETE POST
  const deletePost = async (post) => {
    try {
      await removePost(post);
      Alert.alert("Deleted", "Post has been removed.");
      // We do NOT remove from feedPosts => user must refresh to see it gone
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // 3-dot menu
  const handleMorePress = (post) => {
    if (post.name === user.uid) {
      Alert.alert("Post Options", "Choose an action", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePost(post),
        },
      ]);
    } else {
      Alert.alert("Info", "You are not the owner of this post.");
    }
  };

  // ─────────────────────────────────────────────────────────
  // 4) TOGGLE LIKE => optional local update
  const handleToggleLike = async (post) => {
    try {
      // local update
      setFeedPosts((prev) =>
        prev.map((p) => {
          if (p.id === post.id) {
            const isLiked = p.likedBy?.includes(user.uid);
            let newLikedBy;
            if (isLiked) {
              newLikedBy = p.likedBy.filter((uid) => uid !== user.uid);
            } else {
              newLikedBy = [...(p.likedBy || []), user.uid];
            }
            return { ...p, likedBy: newLikedBy };
          }
          return p;
        })
      );
      // Firestore
      await toggleLike(post);
    } catch (error) {
      Alert.alert("Error", "Failed to update like status");
    }
  };

  // ─────────────────────────────────────────────────────────
  // 5) SHOW WHO LIKED
  const showLikesModal = (post) => {
    if (!post.likedBy?.length) {
      Alert.alert("Likes", "No one has liked this post yet.");
      return;
    }
    setCurrentLikes(post.likedBy);
    setLikesModalVisible(true);
  };

  // ─────────────────────────────────────────────────────────
  // 6) GO TO COMMENTS
  const handleCommentPress = (post) => {
    router.push({
      pathname: "/(screens)/(feed)/"+post.id,
      // params: { id: post.id },
    });
  };

  // ─────────────────────────────────────────────────────────
  // 6.1) GO TO CREATE POST
  const handleCreatePost = () => {
    router.push({
      pathname: "/(screens)/(feed)/CreatePostScreen",
    });
  };

  // ─────────────────────────────────────────────────────────
  // 7) RENDER "WHO LIKED" ITEM
  const renderLikeItem = ({ item: uid }) => {
    const isCurrentUser = uid === user.uid;
    return (
      <View style={styles.likeItem}>
        <Image source={placeholderAvatar} style={styles.smallAvatar} />
        <Text style={styles.likeName}>
          {uid}
          {isCurrentUser ? " (You)" : ""}
        </Text>
      </View>
    );
  };
  const handleViewProfile = (postCreatorId) => {
    router.push({
      pathname: "/see_profile",
      params: { userId: postCreatorId },
    });
  };

  // ─────────────────────────────────────────────────────────
  // 8) RENDER EACH POST
  const renderPost = ({ item: post }) => {
    const isLiked = post.likedBy?.includes(user.uid);
    const likeCount = post.likedBy?.length || 0;
    const commentCount = post.commentCount ?? 0;
    const isOwnPost = post.author.id === DonneurID;

    return (
      <View
        style={[
          styles.feedItem,
          isOwnPost && showOnlyMyPosts && styles.highlightedPost,
        ]}
      >
        <Image
          source={{ uri: post.author.picture_id || placeholderAvatar.uri }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.postHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{isOwnPost ? "You" : post.author.name}</Text>
              {isOwnPost && (
                <View style={styles.myPostBadge}>
                  <Text style={styles.myPostBadgeText}>My Post</Text>
                </View>
              )}
              <Text style={styles.timestamp}>
                {moment(Date.parse(post.created_at.split('.')[0])).fromNow()}
              </Text>
            </View>

            {isOwnPost && (
              <TouchableOpacity onPress={() => handleMorePress(post)}>
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color="#73788B"
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.post}>
            {post.content.text || "No text for this post."}
          </Text>

          {post.image && (
            <TouchableOpacity
              onPress={() => handleViewProfile(post.name)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Like & Comment row */}
          <View style={styles.interactionBar}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => handleToggleLike(post)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FF3B30" : "black"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => handleCommentPress(post)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="black" />
            </TouchableOpacity>

            <View style={styles.countsContainer}>
              <TouchableOpacity
                style={styles.countItem}
                onPress={() => showLikesModal(post)}
              >
                <Ionicons name="heart" size={16} color="#FF3B30" />
                <Text style={styles.countText}>{likeCount}</Text>
              </TouchableOpacity>
              <View style={styles.countItem}>
                <Text style={styles.countText}>{commentCount} comments</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const ItemSeparator = () => <View style={styles.separator} />;

  if (firstLoad == false) {
    return
  }
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {showOnlyMyPosts ? "My Posts" : "Feed"}
          </Text>
          <Animated.View style={{ transform: [{ scale: filterButtonScale }] }}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showOnlyMyPosts && styles.filterButtonActive,
              ]}
              onPress={toggleMyPostsFilter}
            >
              <Ionicons
                name="person"
                size={20}
                color={showOnlyMyPosts ? "white" : "black"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  showOnlyMyPosts && styles.filterButtonTextActive,
                ]}
              >
                {showOnlyMyPosts ? "Viewing My Posts" : "My Posts"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <FlatList
        style={styles.feed}
        data={displayedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name={showOnlyMyPosts ? "person-outline" : "newspaper-outline"}
                size={80}
                color="#CCCCCC"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {showOnlyMyPosts
                ? "You haven't posted yet"
                : "Your feed is empty"}
            </Text>
            <Text style={styles.emptyText}>
              {showOnlyMyPosts
                ? "Share your thoughts, experiences, or a photo with the community!"
                : "Your community is waiting! 🌍💙 Share an update, an event, or a simple message to connect with those who need it most. Every word makes a difference!"}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.emptyButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Create Post Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>

      {/* Likes Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={likesModalVisible}
        onRequestClose={() => setLikesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Liked by</Text>
              <TouchableOpacity onPress={() => setLikesModalVisible(false)}>
                <Ionicons name="close" size={24} color="#73788B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={currentLikes}
              renderItem={renderLikeItem}
              keyExtractor={(item) => item}
              style={styles.likesList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 25 : 10,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitleContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 4,
  },
  filterButtonActive: {
    backgroundColor: "#000",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
    color: "#000",
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  feed: {
    backgroundColor: "#FFF",
  },
  feedItem: {
    backgroundColor: "#FFF",
    padding: 16,
    flexDirection: "row",
  },
  highlightedPost: {
    backgroundColor: "#F8F8F8",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 8,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  myPostBadge: {
    backgroundColor: "#000",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 2,
  },
  myPostBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  post: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
  interactionBar: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  countsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  countItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  countText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#000",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  likesList: {
    marginTop: 10,
  },
  likeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  likeName: {
    fontSize: 16,
    color: "#333",
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    height: 500,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
