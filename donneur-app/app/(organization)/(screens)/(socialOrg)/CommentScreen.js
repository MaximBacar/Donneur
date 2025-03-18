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

/* ------------------------------------------------------
   POST HEADER
   ------------------------------------------------------ */
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

        {/* Already on comment screen => disable */}
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

/* ------------------------------------------------------
   COMMENT ITEM
   ------------------------------------------------------ */
function CommentItem({
  comment,
  user,
  onToggleLike,
  onDelete,
  onReply,
  showCommentLikesModal,
}) {
  // 1) Is it liked?
  const isLiked = comment.likedBy?.includes(user.uid);
  const likeCount = comment.likedBy?.length || 0;
  const showDelete = comment.userId === user.uid;

  // 2) Check if it's a "temp" comment (not yet in Firestore)
  const isTempComment = String(comment.id).startsWith("temp-");

  // 3) Handlers
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
  const handleReply = () => {
    // Only allow replying if it is NOT a temp comment
    if (!isTempComment) {
      onReply(comment);
    }
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
            style={[
              {
                marginLeft: 16,
                flexDirection: "row",
                alignItems: "center",
              },
              // If it's temp, fade & disable
              isTempComment && { opacity: 0.4 },
            ]}
            onPress={handleReply}
            disabled={isTempComment}
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

/* ------------------------------------------------------
   MAIN COMMENT SCREEN
   ------------------------------------------------------ */
export default function CommentScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // From route => postId
  const { id } = useLocalSearchParams();

  // Post state
  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);

  // Comments
  const [responses, setResponses] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // local typed text
  const [newComment, setNewComment] = useState("");
  const [commentCount, setCommentCount] = useState(0);

  // Hooks
  const toggleLikePost = useToggleLike();
  const toggleResponseLike = useToggleResponseLike(id);

  // "Who liked" modal
  const [commentLikesModalVisible, setCommentLikesModalVisible] =
    useState(false);
  const [currentCommentLikes, setCurrentCommentLikes] = useState([]);

  /* ---------------------------
     1) Real-time for Post
     --------------------------- */
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoadingPost(true);
      try {
        const fetched = await fetchPostById(id);
        setCommentCount(fetched.commentCount || 0);
        fetched.currentUserId = user.uid;
        setPost(fetched);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoadingPost(false);
      }
    })();

    const docRef = doc(database, "posts", id);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const updated = snapshot.data();
        setPost((prev) => {
          if (!prev) return null;
          return { ...prev, likedBy: updated.likedBy };
        });
      }
    });

    return () => unsub();
  }, [id, user.uid]);

  /* ---------------------------
     2) Load Comments once + sub
     --------------------------- */
  useEffect(() => {
    if (!id) return;
    loadComments();

    const unsub = subscribeToResponses(
      id,
      (updatedComment) => {
        // real-time for comment likes
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

  const loadComments = async () => {
    setLoadingComments(true);
    setRefreshing(true);
    try {
      const data = await fetchResponses(id);
      setResponses(data);
      setCommentCount(data.length);
    } catch (error) {
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoadingComments(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    loadComments();
  };

  /* ---------------------------
     3) Like/Unlike Post
     --------------------------- */
  const handleToggleLikePost = useCallback(async () => {
    if (!post) return;
    try {
      const isLiked = post.likedBy.includes(user.uid);
      const newLikedBy = isLiked
        ? post.likedBy.filter((uid) => uid !== user.uid)
        : [...post.likedBy, user.uid];
      setPost((prev) => (prev ? { ...prev, likedBy: newLikedBy } : prev));
      await toggleLikePost(post);
    } catch (error) {
      Alert.alert("Error", "Failed to update post like status");
    }
  }, [post, user.uid, toggleLikePost]);

  /* ---------------------------
     4) Like/Unlike Comment
     --------------------------- */
  const handleToggleResponseLike = useCallback(
    async (comment) => {
      try {
        setResponses((prev) =>
          prev.map((c) => {
            if (c.id === comment.id) {
              const isLiked = c.likedBy.includes(user.uid);
              const newLikedBy = isLiked
                ? c.likedBy.filter((uid) => uid !== user.uid)
                : [...c.likedBy, user.uid];
              return { ...c, likedBy: newLikedBy };
            }
            return c;
          })
        );
        await toggleResponseLike(comment);
      } catch (error) {
        Alert.alert("Error", "Failed to update comment like status");
      }
    },
    [toggleResponseLike, user.uid]
  );

  /* ---------------------------
     5) Add a new comment
     --------------------------- */
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    if (!user) {
      Alert.alert("Error", "You must be logged in to comment.");
      return;
    }

    // local "fake" comment with "temp-" prefix
    const tempId = "temp-" + Date.now().toString();
    const tempComment = {
      id: tempId,
      userId: user.uid,
      text: newComment,
      timestamp: new Date(),
      likedBy: [],
    };

    // push locally
    setResponses((prev) => [tempComment, ...prev]);
    setCommentCount((c) => c + 1);
    setNewComment("");

    try {
      // Actually add to Firestore
      const realDoc = await addResponse(id, user, tempComment.text);
      // realDoc = { id: "abc123", userId: "...", text: "..." }

      // Replace local tempId with the real doc ID
      setResponses((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? { ...c, id: realDoc.id } // fix the ID
            : c
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add comment");
      // revert local
      setResponses((prev) => prev.filter((c) => c.id !== tempId));
      setCommentCount((c) => c - 1);
    }
  }, [id, user, newComment]);

  /* ---------------------------
     6) Delete a comment
     --------------------------- */
  const handleDeleteComment = useCallback(
    async (comment) => {
      try {
        setResponses((prev) => prev.filter((c) => c.id !== comment.id));
        setCommentCount((c) => c - 1);
        await deleteResponse(id, user, comment);
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to delete comment");
        // revert
        setResponses((prev) => [...prev, comment]);
        setCommentCount((c) => c + 1);
      }
    },
    [id, user]
  );

  /* ---------------------------
     7) Go to "AnswerScreen"
     --------------------------- */
  const handleReplyPress = (comment) => {
    // If it's a real comment (not temp), we can navigate
    router.push({
      pathname: "/AnswerScreen",
      params: { id: id, commentId: comment.id },
    });
  };

  /* ---------------------------
     8) "Who Liked" a comment
     --------------------------- */
  const showCommentLikesModal = (comment) => {
    if (!comment.likedBy?.length) {
      Alert.alert("Likes", "No one has liked this comment yet.");
      return;
    }
    setCurrentCommentLikes(comment.likedBy);
    setCommentLikesModalVisible(true);
  };
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

  /* ---------------------------
     9) Render each comment
     --------------------------- */
  const renderComment = ({ item }) => (
    <CommentItem
      comment={item}
      user={user}
      onToggleLike={handleToggleResponseLike}
      onDelete={handleDeleteComment}
      onReply={handleReplyPress}
      showCommentLikesModal={showCommentLikesModal}
    />
  );

  /* ---------------------------
     10) Go back
     --------------------------- */
  const handleGoBack = () => {
    router.back();
  };

  /* ---------------------------
     RENDER
     --------------------------- */
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
          // Show the post at the top
          ListHeaderComponent={
            loadingPost ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#999" />
              </View>
            ) : (
              post && (
                <PostHeader
                  post={{ ...post, currentUserId: user.uid }}
                  onToggleLikePost={handleToggleLikePost}
                  commentCount={commentCount}
                />
              )
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

        {/* "Who Liked" Modal */}
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

/* ------------------------------------------------------
   STYLES
   ------------------------------------------------------ */
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
