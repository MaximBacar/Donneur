// app/(tabs)/CommentScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "../../../../context/authContext";
import {
  fetchPostById,
  useToggleLike,
  fetchResponses,
  addResponse,
  useToggleResponseLike,
  subscribeToResponses,
  deleteResponse,
} from "./postService";
import { doc, onSnapshot } from "firebase/firestore";
import { database } from "../../../../config/firebase";

const placeholderAvatar = { uri: "https://i.pravatar.cc/300" };


function PostHeader({ post, onToggleLikePost, commentCount }) {
  if (!post) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "#999" }}>Post not found</Text>
      </View>
    );
  }

  const isLiked = post.likedBy?.includes(post.currentUserId);
  const likeCount = post.likedBy?.length || 0;

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeaderRow}>
        <Text style={styles.postOwner}>{post.name}</Text>
        <Text style={styles.timestamp}>
          {post.timestamp?.toDate
            ? moment(post.timestamp.toDate()).fromNow()
            : "Some time ago"}
        </Text>
      </View>

      <Text style={styles.postText}>
        {post.text || "No text for this post."}
      </Text>

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Like & Comment row */}
      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={onToggleLikePost}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color="black"
          />
        </TouchableOpacity>

        {/* Disabled comment button (already on comment screen) */}
        <TouchableOpacity style={[styles.circleButton, { opacity: 0.3 }]}>
          <Ionicons name="chatbubble-outline" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.countsContainer}>
          <View style={styles.countItem}>
            <Ionicons name="heart" size={16} color="black" />
            <Text style={styles.countText}>{likeCount}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countText}>{commentCount} comments</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


function CommentItem({
  comment,
  user,
  onToggleLike,
  onDelete,
  onReply,
  showCommentLikesModal,
}) {
  const isLiked = comment.likedBy?.includes(user.uid);
  const likeCount = comment.likedBy?.length || 0;
  const showDelete = comment.userId === user.uid;

  // Delete
  const handleDelete = () => {
    Alert.alert("Delete Comment?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(comment),
      },
    ]);
  };

  // Reply
  const handleReply = () => {
    onReply(comment); // We'll let the parent navigate
  };

  return (
    <View style={styles.commentItem}>
      <View style={{ flex: 1 }}>
        {/* We only store userId => display it */}
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserId}>{comment.userId}</Text>
          <Text style={styles.commentTime}>
            {comment.timestamp?.toDate
              ? moment(comment.timestamp.toDate()).fromNow()
              : "Some time ago"}
          </Text>
        </View>

        <Text style={styles.commentText}>{comment.text}</Text>

        <View style={styles.commentActions}>
          {/* Like comment */}
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onToggleLike(comment)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={18}
              color="black"
            />
          </TouchableOpacity>

          {/* Tap on the likeCount => show "who liked" modal */}
          <TouchableOpacity
            onPress={() => showCommentLikesModal(comment)}
            style={{ marginLeft: 2 }}
          >
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>

          {/* Delete (only if comment owner) */}
          {showDelete && (
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={handleDelete}>
              <Ionicons name="trash" size={18} color="red" />
            </TouchableOpacity>
          )}

          {/* Reply icon + count */}
          <TouchableOpacity
            style={{
              marginLeft: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={handleReply}
          >
            <Ionicons name="chatbubble-outline" size={18} color="black" />
            <Text style={{ marginLeft: 4, fontSize: 11, color: "black" }}>
              {comment.answerCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMMENT SCREEN
export default function CommentScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // 1) Grab id from route params
  const { id } = useLocalSearchParams();

  // Post state
  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);

  // Comments state
  const [responses, setResponses] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // local typed text
  const [newComment, setNewComment] = useState("");
  // local commentCount
  const [commentCount, setCommentCount] = useState(0);

  // Hooks
  const toggleLikePost = useToggleLike();
  const toggleResponseLike = useToggleResponseLike(id);

  // -------------- New states for "Who Liked" modal for comments
  const [commentLikesModalVisible, setCommentLikesModalVisible] =
    useState(false);
  const [currentCommentLikes, setCurrentCommentLikes] = useState([]);

  // ─────────────────────────────────────────────────────────
  // 2) PARTIAL REAL-TIME FOR POST => only for `likedBy`
  useEffect(() => {
    if (!id) return;

    // A) fetch post once
    (async () => {
      setLoadingPost(true);
      try {
        const fetched = await fetchPostById(id);
        // store doc's commentCount in local
        setCommentCount(fetched.commentCount || 0);
        // attach currentUserId so we know if liked
        fetched.currentUserId = user.uid;
        setPost(fetched);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoadingPost(false);
      }
    })();

    // B) onSnapshot => only update likedBy
    const docRef = doc(database, "posts", id);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const updated = snapshot.data();
        setPost((prev) => {
          if (!prev) return null;
          // only update likedBy, keep old commentCount
          return { ...prev, likedBy: updated.likedBy };
        });
      }
    });

    return () => unsub();
  }, [id, user.uid]);

  // ─────────────────────────────────────────────────────────
  // 3) COMMENTS => fetch once + partial real-time for likes
  useEffect(() => {
    if (!id) return;
    loadComments();

    const unsub = subscribeToResponses(
      id,
      (updatedComment) => {
        // partial real-time for comment likes
        setResponses((prev) =>
          prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
        );
      },
      (error) => {
        console.error("subscribeToResponses error:", error);
      }
    );

    return () => unsub();
  }, [id]);

  // fetch comments
  const loadComments = async () => {
    setLoadingComments(true);
    setRefreshing(true);
    try {
      const data = await fetchResponses(id);
      setResponses(data);
      // local count of comments
      setCommentCount(data.length);
    } catch (error) {
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoadingComments(false);
      setRefreshing(false);
    }
  };

  // pull-to-refresh
  const onRefresh = () => {
    loadComments();
  };

  // ─────────────────────────────────────────────────────────
  // 4) GO BACK
  const handleGoBack = () => {
    router.back();
  };

  // ─────────────────────────────────────────────────────────
  // 5) LIKE/UNLIKE POST
  const handleToggleLikePost = useCallback(async () => {
    if (!post) return;
    try {
      const isLiked = post.likedBy.includes(user.uid);
      let newLikedBy;
      if (isLiked) {
        newLikedBy = post.likedBy.filter((uid) => uid !== user.uid);
      } else {
        newLikedBy = [...post.likedBy, user.uid];
      }
      // local update
      setPost((prev) => (prev ? { ...prev, likedBy: newLikedBy } : prev));
      // Firestore
      await toggleLikePost(post);
    } catch (error) {
      Alert.alert("Error", "Failed to update post like status");
    }
  }, [post, user.uid, toggleLikePost]);

  // ─────────────────────────────────────────────────────────
  // 6) LIKE/UNLIKE COMMENT
  const handleToggleResponseLike = useCallback(
    async (comment) => {
      try {
        // local update
        setResponses((prev) =>
          prev.map((c) => {
            if (c.id === comment.id) {
              const isLiked = c.likedBy.includes(user.uid);
              let newLikedBy;
              if (isLiked) {
                newLikedBy = c.likedBy.filter((uid) => uid !== user.uid);
              } else {
                newLikedBy = [...c.likedBy, user.uid];
              }
              return { ...c, likedBy: newLikedBy };
            }
            return c;
          })
        );
        // Firestore
        await toggleResponseLike(comment);
      } catch (error) {
        Alert.alert("Error", "Failed to update comment like status");
      }
    },
    [toggleResponseLike, user.uid]
  );

  // ─────────────────────────────────────────────────────────
  // 7) ADD NEW COMMENT => increments local commentCount
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    if (!user) {
      Alert.alert("Error", "You must be logged in to comment.");
      return;
    }

    // local "fake" comment
    const tempId = Date.now().toString();
    const newObj = {
      id: tempId,
      userId: user.uid,
      text: newComment,
      timestamp: new Date(),
      likedBy: [],
    };
    // local push
    setResponses((prev) => [newObj, ...prev]);
    // local increment
    setCommentCount((c) => c + 1);
    setNewComment("");

    try {
      // => calls addResponse in postService => increments Firestore post.commentCount
      await addResponse(id, user, newComment);
    } catch (error) {
      Alert.alert("Error", "Failed to add comment");
      // revert local
      setResponses((prev) => prev.filter((c) => c.id !== tempId));
      setCommentCount((c) => c - 1);
    }
  }, [id, user, newComment]);

  // ─────────────────────────────────────────────────────────
  // 8) DELETE COMMENT => decrement local commentCount
  const handleDeleteComment = useCallback(
    async (comment) => {
      try {
        // local remove
        setResponses((prev) => prev.filter((c) => c.id !== comment.id));
        // local decrement
        setCommentCount((c) => c - 1);

        // => calls deleteResponse => decrements Firestore post.commentCount
        await deleteResponse(id, user, comment);
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to delete comment");
        // revert local
        setResponses((prev) => [...prev, comment]);
        setCommentCount((c) => c + 1);
      }
    },
    [id, user]
  );

  // ─────────────────────────────────────────────────────────
  // 9) REPLY => Navigate to an "AnswerScreen"
  const handleReplyPress = (comment) => {
    router.push({
      pathname: "/(screens)/(feed)/AnswerScreen",
      params: {
        id: id,
        commentId: comment.id,
      },
    });
  };
  // ─────────────────────────────────────────────────────────
  // 10) SHOW WHO LIKED THIS COMMENT (like the posts do)

  const showCommentLikesModal = (comment) => {
    if (!comment.likedBy?.length) {
      Alert.alert("Likes", "No one has liked this comment yet.");
      return;
    }
    setCurrentCommentLikes(comment.likedBy);
    setCommentLikesModalVisible(true);
  };

  // RENDER each user in comment.likedBy
  const renderCommentLikeItem = ({ item: uid }) => {
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

  // ─────────────────────────────────────────────────────────
  // RENDER COMMENT
  const renderComment = useCallback(
    ({ item }) => (
      <CommentItem
        comment={item}
        user={user}
        onToggleLike={handleToggleResponseLike}
        onDelete={handleDeleteComment}
        onReply={handleReplyPress}
        showCommentLikesModal={showCommentLikesModal} // pass the function
      />
    ),
    [user, handleToggleResponseLike, handleDeleteComment, showCommentLikesModal]
  );

  // ─────────────────────────────────────────────────────────
  // RENDER
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Comments</Text>
        </View>

        <FlatList
          data={loadingComments ? [] : responses}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            !loadingComments && (
              <Text style={styles.emptyText}>No comments yet</Text>
            )
          }
          // Show the post at top
          ListHeaderComponent={
            loadingPost ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#999" />
              </View>
            ) : (
              <PostHeader
                post={post ? { ...post, currentUserId: user.uid } : null}
                onToggleLikePost={handleToggleLikePost}
                commentCount={commentCount}
              />
            )
          }
        />

        {/* Input row to add comment */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleAddComment}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Who Liked This Comment Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={commentLikesModalVisible}
          onRequestClose={() => setCommentLikesModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comment Liked By</Text>
                <TouchableOpacity
                  onPress={() => setCommentLikesModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#73788B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={currentCommentLikes}
                renderItem={renderCommentLikeItem}
                keyExtractor={(uid) => uid}
                style={styles.likesList}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// =========== STYLES ===========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "android" ? 25 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginLeft: 16,
    marginRight: 16,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },

  // Post
  postContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  postHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  postOwner: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  postText: {
    marginTop: 8,
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
  interactionBar: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 13,
    color: "#000",
  },

  // Comment items
  commentItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentUserId: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  commentTime: {
    fontSize: 11,
    color: "#666",
  },
  commentText: {
    fontSize: 13,
    color: "#000",
    marginTop: 4,
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
  },
  likeButton: {
    marginRight: 6,
  },
  likeCount: {
    fontSize: 11,
    color: "#000",
    marginLeft: 2,
  },

  // Input row
  inputRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    padding: 8,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 16,
  },

  // "Who Liked" Modal
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
    height: "50%",
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
    fontSize: 14,
    color: "#333",
  },
});
