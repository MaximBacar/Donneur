// app/(tabs)/AnswerScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Image, // <-- Import for avatars
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { database } from "../../../../config/firebase";

import { useAuth } from "../../../../context/authContext";
import {
  fetchCommentById,
  fetchAnswers,
  addAnswer,
  subscribeToAnswers,
  // For the top-level comment (in /responses):
  useToggleResponseLike,
  // For each answer (in /answers):
  useToggleAnswerLike,
  deleteAnswer,
} from "./postService";

// A small helper to create a random avatar URL for a given UID
const placeholderAvatar = (uid) => `https://i.pravatar.cc/150?u=${uid}`;

/* ------------------------------------------------------------------
   CommentHeader: displays the main comment info (like a mini-post)
   ------------------------------------------------------------------ */
function CommentHeader({ comment, onToggleLikeComment, answerCount }) {
  if (!comment) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "#999" }}>Comment not found</Text>
      </View>
    );
  }

  const isLiked = comment.likedBy?.includes(comment.currentUserId);
  const likeCount = comment.likedBy?.length || 0;

  return (
    <View style={styles.commentContainer}>
      {/* Top row: user + time */}
      <View style={styles.commentHeaderRow}>
        <Text style={styles.commentUserId}>{comment.userId}</Text>
        <Text style={styles.commentTime}>
          {comment.timestamp?.toDate
            ? moment(comment.timestamp.toDate()).fromNow()
            : "Some time ago"}
        </Text>
      </View>

      {/* Comment text */}
      <Text style={styles.commentText}>{comment.text}</Text>

      {/* Like + Answers row */}
      <View style={styles.interactionBar}>
        {/* Like button */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={onToggleLikeComment}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color="black"
          />
        </TouchableOpacity>

        {/* Like count + Answer count */}
        <View style={styles.countsContainer}>
          <Text style={styles.countText}>{likeCount} </Text>
          <Text style={styles.countText}>{answerCount} answers</Text>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------
   AnswerItem: displays each individual answer in the list
   ------------------------------------------------------------------ */
function AnswerItem({
  answer,
  user,
  onToggleLike,
  onDelete,
  showAnswerLikesModal,
}) {
  const isLiked = answer.likedBy?.includes(user.uid);
  const likeCount = answer.likedBy?.length || 0;
  const showDelete = answer.userId === user.uid;

  const handleDelete = () => {
    Alert.alert("Delete Answer?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(answer),
      },
    ]);
  };

  return (
    <View style={styles.answerItem}>
      <View style={{ flex: 1 }}>
        {/* Header: user + time */}
        <View style={styles.answerHeader}>
          <Text style={styles.answerUserId}>{answer.userId}</Text>
          <Text style={styles.answerTime}>
            {answer.timestamp?.toDate
              ? moment(answer.timestamp.toDate()).fromNow()
              : "Some time ago"}
          </Text>
        </View>

        {/* Answer text */}
        <Text style={styles.answerText}>{answer.text}</Text>

        {/* Like / Who Liked / Delete */}
        <View style={styles.answerActions}>
          {/* Like/unlike button */}
          <TouchableOpacity
            style={{ marginRight: 6 }}
            onPress={() => onToggleLike(answer)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={18}
              color="black"
            />
          </TouchableOpacity>

          {/* Tapping the number opens "who liked" modal */}
          <TouchableOpacity onPress={() => showAnswerLikesModal(answer)}>
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>

          {/* Delete if owner */}
          {showDelete && (
            <TouchableOpacity style={{ marginLeft: 16 }} onPress={handleDelete}>
              <Ionicons name="trash" size={18} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------
   MAIN: AnswerScreen
   ------------------------------------------------------------------ */
export default function AnswerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, commentId } = useLocalSearchParams();

  const [comment, setComment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [answerCount, setAnswerCount] = useState(0);

  const [answerLikesModalVisible, setAnswerLikesModalVisible] = useState(false);
  const [currentAnswerLikes, setCurrentAnswerLikes] = useState([]);

  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingComment, setLoadingComment] = useState(true);

  // For the top-level comment (which is stored in /posts/{id}/responses/{commentId})
  const toggleLikeComment = useToggleResponseLike(id);

  // For each answer in /posts/{id}/responses/{commentId}/answers/{answerId}
  const toggleLikeAnswer = useToggleAnswerLike(id, commentId);

  /* -------------------------------------------------------
     Show the "who liked this answer" modal
     ------------------------------------------------------- */
  const showAnswerLikesModal = (answer) => {
    if (!answer.likedBy?.length) {
      Alert.alert("Likes", "No one has liked this answer yet.");
      return;
    }
    setCurrentAnswerLikes(answer.likedBy);
    setAnswerLikesModalVisible(true);
  };

  /* Render each user in "who liked" the answer */
  const renderAnswerLikeItem = ({ item: uid }) => {
    const isCurrentUser = uid === user.uid;
    return (
      <View style={styles.likeItem}>
        {/* Show a random avatar for each UID */}
        <Image
          source={{ uri: placeholderAvatar(uid) }}
          style={styles.smallAvatar}
        />
        <Text style={styles.likeName}>
          {uid}
          {isCurrentUser ? " (You)" : ""}
        </Text>
      </View>
    );
  };

  /* -------------------------------------------------------
     Fetch the top-level comment (like a mini-post)
     ------------------------------------------------------- */
  useEffect(() => {
    if (!id || !commentId) return;

    setLoadingComment(true);
    (async () => {
      try {
        const fetched = await fetchCommentById(id, commentId);
        // So we can check if user liked
        fetched.currentUserId = user.uid;
        setComment(fetched);
      } catch (error) {
        console.error("Error fetching comment:", error);
      } finally {
        setLoadingComment(false);
      }
    })();

    // Real-time updates to comment's "likedBy"
    const docRef = doc(database, "posts", id, "responses", commentId);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const updated = snapshot.data();
        setComment((prev) =>
          prev ? { ...prev, likedBy: updated.likedBy } : prev
        );
      }
    });
    return () => unsub();
  }, [id, commentId, user.uid]);

  /* -------------------------------------------------------
     Fetch answers + real-time updates to each answer's likes
     ------------------------------------------------------- */
  useEffect(() => {
    if (!id || !commentId) return;
    loadAnswers();

    const unsub = subscribeToAnswers(id, commentId, (updatedAnswer) => {
      setAnswers((prev) =>
        prev.map((a) => (a.id === updatedAnswer.id ? updatedAnswer : a))
      );
    });
    return () => unsub();
  }, [id, commentId]);

  /* Actually load all answers (pull to refresh, etc.) */
  const loadAnswers = async () => {
    setLoadingAnswers(true);
    setRefreshing(true);
    try {
      const data = await fetchAnswers(id, commentId);
      setAnswers(data);
      setAnswerCount(data.length);
    } catch (error) {
      Alert.alert("Error", "Failed to load answers");
    } finally {
      setLoadingAnswers(false);
      setRefreshing(false);
    }
  };

  /* -------------------------------------------------------
     Like/Unlike the top-level comment
     ------------------------------------------------------- */
  const handleToggleLikeComment = async () => {
    if (!comment) return;
    const isLiked = comment.likedBy.includes(user.uid);
    const newLikedBy = isLiked
      ? comment.likedBy.filter((uid) => uid !== user.uid)
      : [...comment.likedBy, user.uid];

    // Locally update
    setComment({ ...comment, likedBy: newLikedBy });

    // Firestore update
    await toggleLikeComment(comment);
  };

  /* -------------------------------------------------------
     Like/Unlike an answer
     ------------------------------------------------------- */
  const handleToggleLikeAnswer = async (answer) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answer.id
          ? {
              ...a,
              likedBy: a.likedBy.includes(user.uid)
                ? a.likedBy.filter((uid) => uid !== user.uid)
                : [...a.likedBy, user.uid],
            }
          : a
      )
    );
    await toggleLikeAnswer(answer);
  };

  /* -------------------------------------------------------
     Add a new answer
     ------------------------------------------------------- */
  const handleAddAnswer = async () => {
    if (!newAnswer.trim()) return;
    const tempId = Date.now().toString();
    const newObj = {
      id: tempId,
      userId: user.uid,
      text: newAnswer,
      timestamp: new Date(),
      likedBy: [],
    };

    // Local optimistic update
    setAnswers((prev) => [newObj, ...prev]);
    setAnswerCount((c) => c + 1);
    setNewAnswer("");

    try {
      await addAnswer(id, commentId, user, newAnswer);
    } catch (error) {
      // Revert on error
      setAnswers((prev) => prev.filter((a) => a.id !== tempId));
      setAnswerCount((c) => c - 1);
    }
  };

  /* -------------------------------------------------------
     Delete an answer
     ------------------------------------------------------- */
  const handleDeleteAnswer = async (answer) => {
    Alert.alert("Delete Answer?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Local removal
            setAnswers((prev) => prev.filter((a) => a.id !== answer.id));
            setAnswerCount((c) => c - 1);

            await deleteAnswer(id, user, commentId, answer);
          } catch (err) {
            Alert.alert("Error", err.message || "Failed to delete answer");
            // revert
            setAnswers((prev) => [...prev, answer]);
            setAnswerCount((c) => c + 1);
          }
        },
      },
    ]);
  };

  /* -------------------------------------------------------
     Nav: go back
     ------------------------------------------------------- */
  const handleGoBack = () => {
    router.back();
  };

  /* Render each answer item */
  const renderItem = ({ item }) => (
    <AnswerItem
      answer={item}
      user={user}
      onToggleLike={handleToggleLikeAnswer}
      onDelete={handleDeleteAnswer}
      showAnswerLikesModal={showAnswerLikesModal}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Answers</Text>
        </View>

        {/* The list of answers */}
        <FlatList
          data={loadingAnswers ? [] : answers}
          keyExtractor={(item) => item.id}
          onRefresh={loadAnswers}
          refreshing={refreshing}
          ListEmptyComponent={
            !loadingAnswers && (
              <Text style={styles.emptyText}>No answers yet</Text>
            )
          }
          /* Show the main comment at top */
          ListHeaderComponent={
            loadingComment ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#999" />
              </View>
            ) : comment ? (
              <CommentHeader
                comment={{ ...comment, currentUserId: user.uid }}
                onToggleLikeComment={handleToggleLikeComment}
                answerCount={answerCount}
              />
            ) : null
          }
          renderItem={renderItem}
        />

        {/* Input row to add a new answer */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write an answer..."
            placeholderTextColor="#999"
            value={newAnswer}
            onChangeText={setNewAnswer}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleAddAnswer}>
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* "Who Liked" modal for answers */}
        <Modal
          animationType="slide"
          transparent
          visible={answerLikesModalVisible}
          onRequestClose={() => setAnswerLikesModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Answer Liked By</Text>
                <TouchableOpacity
                  onPress={() => setAnswerLikesModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#73788B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={currentAnswerLikes}
                keyExtractor={(uid) => uid}
                renderItem={renderAnswerLikeItem}
                style={styles.likesList}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------
   STYLES
   ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 25 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    marginLeft: 16,
    marginRight: 16,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },

  // Main comment (CommentHeader)
  commentContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#FFF",
  },
  commentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentUserId: {
    fontSize: 14,
    fontWeight: "bold",
  },
  commentTime: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    marginTop: 4,
    color: "#000",
  },
  interactionBar: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#EEE",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  countsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  countText: {
    fontSize: 13,
    color: "#333",
  },

  // Each answer
  answerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#FFF",
  },
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  answerUserId: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  answerTime: {
    fontSize: 11,
    color: "#666",
  },
  answerText: {
    fontSize: 13,
    color: "#000",
    marginTop: 4,
  },
  answerActions: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
  },
  likeCount: {
    fontSize: 11,
    marginLeft: 4,
    color: "#000",
  },

  // Input row
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
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

  // "Who Liked" modal
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
    marginRight: 8,
  },
  likeName: {
    fontSize: 14,
    color: "#333",
  },
});
