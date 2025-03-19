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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useRouter } from "expo-router";

import { useAuth } from "../../../../context/authContext";
import {
  fetchPostsOnce, // For manual fetch of all posts
  useDeletePost,
  useToggleLike,
  fetchUserPostsOnce,
} from "./postService";

// Firestore for partial real-time
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { database } from "../../../../config/firebase";

const placeholderAvatar = { uri: "https://i.pravatar.cc/300" };

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // State for feed
  const [feedPosts, setFeedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Hooks for delete & like
  const removePost = useDeletePost();
  const toggleLike = useToggleLike();

  // "Who liked" modal
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [currentLikes, setCurrentLikes] = useState([]);

  // ─────────────────────────────────────────────────────────
  // 1) ON MOUNT: fetch once + partial real-time for doc changes
  useEffect(() => {
    // A) Initial fetch
    loadPosts();

    // B) onSnapshot => merges 'likedBy' AND 'commentCount' if doc is "modified"
    const q = query(
      collection(database, "posts"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const updatedDoc = change.doc.data();
          const docId = change.doc.id;

          setFeedPosts((prev) =>
            prev.map((p) => {
              if (p.id === docId) {
                // Merge BOTH likedBy and commentCount from updated doc
                return {
                  ...p,
                  likedBy: updatedDoc.likedBy,
                  commentCount: updatedDoc.commentCount, // <--- crucial
                };
              }
              return p;
            })
          );
        }
        // If doc is "added" or "removed", ignore => user must refresh
      });
    });

    return () => unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────
  // 2) LOAD POSTS (for initial or pull-to-refresh)
  const loadPosts = async () => {
    setRefreshing(true);
    try {
      const posts = await fetchUserPostsOnce(user.uid);
      setFeedPosts(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setRefreshing(false);
  };

  // Pull-to-refresh
  const onRefresh = () => {
    loadPosts();
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
  //    Instead of an inline push, define a small function:
  const handleCommentPress = (post) => {
    router.push({
      pathname: "/CommentScreen",
      params: { id: post.id },
    });
  };

  // ─────────────────────────────────────────────────────────
  // 6.1) GO TO CREATE POST
  const handleCreatePost = () => {
    router.push({
      pathname: "/CreatePostScreen",
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

    // ✅ Now we read post.commentCount from the doc
    const commentCount = post.commentCount ?? 0;

    return (
      <View style={styles.feedItem}>
        <Image
          source={{ uri: post.avatar || placeholderAvatar.uri }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.postHeader}>
            <View>
              <Text style={styles.name}>{post.name}</Text>
              <Text style={styles.timestamp}>
                {post.timestamp?.toDate
                  ? moment(post.timestamp.toDate()).fromNow()
                  : "Some time ago"}
              </Text>
            </View>

            {post.name === user.uid && (
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
            {post.text || "No text for this post."}
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
                color="black"
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
                <Ionicons name="heart" size={16} color="black" />
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

  // ─────────────────────────────────────────────────────────
  // 9) MAIN RENDER
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </View>

      <FlatList
        style={styles.feed}
        data={feedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="newspaper-outline" size={80} color="#CCCCCC" />
            </View>
            <Text style={styles.emptyTitle}>Your feed is empty</Text>
            <Text style={styles.emptyText}>
              Your community is waiting! 🌍💙 Share an update, an event, or a
              simple message to connect with those who need it most. Every word
              makes a difference!"
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  feed: {
    backgroundColor: "#FFF",
  },
  feedItem: {
    backgroundColor: "#FFF",
    padding: 16,
    flexDirection: "row",
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
    alignItems: "center",
    paddingRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
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
  // New empty state styles
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
