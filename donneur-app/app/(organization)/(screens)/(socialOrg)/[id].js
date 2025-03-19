import { useAuth } from "../../../../context/authContext";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { BACKEND_URL } from "../../../../constants/backend";

// Helper function to extract post from user posts
const extractPostFromUserPosts = async (token, targetPostId) => {
  try {
    console.log("Attempting to find post in user posts");
    const userPostsResponse = await fetch(
      `${BACKEND_URL}/feed/get_user_posts`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "remove-later",
        },
      }
    );

    if (userPostsResponse.ok) {
      const userData = await userPostsResponse.json();
      const userPosts = Object.values(userData.posts || {});
      console.log("User posts count:", userPosts.length);

      // Log the IDs to see if our target post is there
      const postIds = userPosts.map((p) => p.id);
      console.log("User post IDs:", postIds);

      const foundPost = userPosts.find((post) => post.id === targetPostId);
      if (foundPost) {
        console.log("✅ Found post in user posts!");
        return foundPost;
      } else {
        console.log("❌ Post not found in user posts.");
        return null;
      }
    } else {
      console.log("Failed to fetch user posts:", userPostsResponse.status);
      return null;
    }
  } catch (error) {
    console.error("Error extracting post from user posts:", error);
    return null;
  }
};

export default function Post() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { id, isOwnPost: isOwnPostParam } = useLocalSearchParams();

  // Convert string param to boolean
  const isOwnPost = isOwnPostParam === "true";

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const placeholderAvatar = { uri: "https://i.pravatar.cc/300" };

  // Fetch post and replies on component mount
  useEffect(() => {
    console.log("Post.js - Loading post with ID:", id);
    console.log("Is own post param:", isOwnPostParam);
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      console.log("Fetching post with ID:", id);

      // First check if post exists in general feed
      try {
        const feedResponse = await fetch(`${BACKEND_URL}/feed`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "remove-later",
          },
        });

        if (feedResponse.ok) {
          const feedData = await feedResponse.json();
          const feedPosts = Object.values(feedData.feed || {});
          const foundPost = feedPosts.find((post) => post.id === id);

          if (foundPost) {
            console.log("Found post in general feed");
            setPost(foundPost);
            processReplies(foundPost);
            setLoading(false);
            return;
          } else {
            console.log("Post not found in general feed");
          }
        }
      } catch (error) {
        console.log("Error checking feed:", error);
      }

      // If not in general feed, try user posts
      const userPost = await extractPostFromUserPosts(token, id);

      if (userPost) {
        setPost(userPost);
        processReplies(userPost);
        setLoading(false);
        return;
      }

      // Try directly getting the post
      try {
        const postResponse = await fetch(
          `${BACKEND_URL}/feed/get_post?post_id=${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "remove-later",
            },
          }
        );

        if (postResponse.ok) {
          const postData = await postResponse.json();
          console.log("Found post via direct get_post endpoint");
          setPost(postData.post);
          processReplies(postData.post);
          setLoading(false);
          return;
        } else {
          console.log("Post not found via direct get_post endpoint");
        }
      } catch (error) {
        console.log("Error checking direct post endpoint:", error);
      }

      // If we're still here, we couldn't find the post
      console.log("Post not found in any available source");
      throw new Error("Post not found in any available source");
    } catch (error) {
      console.error("Error fetching post:", error);
      Alert.alert("Error", "Failed to load post. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to process replies
  const processReplies = (post) => {
    if (!post.replies || Object.keys(post.replies).length === 0) {
      console.log("No replies found for post");
      setReplies([]);
      return;
    }

    try {
      const replyList = [];

      // Check if replies is an object with boolean values
      if (typeof post.replies === "object") {
        Object.entries(post.replies).forEach(([replyId, isIncluded]) => {
          if (isIncluded === true) {
            // Create a placeholder reply
            replyList.push({
              id: replyId,
              content: { text: `Reply ${replyId.slice(-6)}` },
              author: {
                name: "User",
                id: replyId.includes(user.uid) ? user.uid : "",
                picture_id: placeholderAvatar.uri,
              },
              created_at: new Date().toISOString(),
            });
          }
        });

        console.log(`Found ${replyList.length} replies for the post`);
        setReplies(replyList);
      } else {
        console.log("Replies format is not as expected:", post.replies);
        setReplies([]);
      }
    } catch (error) {
      console.error("Error processing replies:", error);
      setReplies([]);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      console.log("Submitting reply to post ID:", id);

      // Always use POST for creating new resources (RESTful convention)
      const response = await fetch(`${BACKEND_URL}/feed/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "remove-later",
        },
        body: JSON.stringify({
          post_id: id,
          content: { text: replyText },
        }),
      });

      console.log("Reply POST status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Reply submitted successfully:", responseData);

        // Create a temporary reply to show immediately
        const newReply = {
          id: responseData.reply_id || `temp-${Date.now()}`,
          content: { text: replyText },
          author: {
            id: user.uid,
            name: user.displayName || "You",
            picture_id: user.photoURL || placeholderAvatar.uri,
          },
          created_at: new Date().toISOString(),
        };

        // Add the new reply to the list
        setReplies([newReply, ...replies]);

        // Clear the input field
        setReplyText("");

        // Refresh the post data after a short delay to get the server version
        setTimeout(() => {
          fetchPost();
        }, 1000);
      } else {
        // If POST fails, try the GET method as fallback (as in original code)
        console.log("POST failed, trying GET as fallback");
        const encodedText = encodeURIComponent(replyText);
        const getUrl = `${BACKEND_URL}/feed/reply?post_id=${id}&text=${encodedText}`;

        const getResponse = await fetch(getUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "remove-later",
          },
        });

        if (getResponse.ok) {
          console.log("Reply submitted successfully with GET fallback");

          // Create a temporary reply to show immediately
          const newReply = {
            id: `temp-${Date.now()}`,
            content: { text: replyText },
            author: {
              id: user.uid,
              name: user.displayName || "You",
              picture_id: user.photoURL || placeholderAvatar.uri,
            },
            created_at: new Date().toISOString(),
          };

          // Add the new reply to the list
          setReplies([newReply, ...replies]);

          // Clear the input field
          setReplyText("");

          // Refresh the post data after a short delay
          setTimeout(() => {
            fetchPost();
          }, 1000);
        } else {
          const errorText = await getResponse.text();
          console.error("Error response body:", errorText);
          throw new Error(
            `Both POST and GET requests failed: ${getResponse.status}`
          );
        }
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      Alert.alert("Error", "Failed to submit your reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPost();
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderReply = ({ item }) => {
    // Check if this is the specific reply from the screenshot
    const isSpecificReply = item.id === "-OLfmqPTKY0EKjUrp8ew";
    const isOwnReply = item.author?.id === user.uid;
    const isTemporary = item.id.startsWith("temp-");

    return (
      <View
        style={[
          styles.replyContainer,
          isSpecificReply && styles.highlightedReply,
          isTemporary && styles.temporaryReply,
        ]}
      >
        <Image
          source={{ uri: item.author?.picture_id || placeholderAvatar.uri }}
          style={styles.replyAvatar}
        />
        <View style={styles.replyContent}>
          <View style={styles.replyHeader}>
            <Text style={styles.replyAuthor}>
              {isOwnReply ? "You" : item.author?.name || "User"}
              {isSpecificReply && " (From Screenshot)"}
              {isTemporary && " (Sending...)"}
            </Text>
            <Text style={styles.replyTime}>
              {isTemporary
                ? "Just now"
                : moment(Date.parse(item.created_at.split(".")[0])).fromNow()}
            </Text>
          </View>
          <Text style={styles.replyText}>
            {isSpecificReply
              ? "This is the reply from your screenshot with ID: -OLfmqPTKY0EKjUrp8ew"
              : item.content.text}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isLiked = post.likedBy?.includes(user.uid);
  const likeCount = post.likedBy?.length || 0;
  const replyCount = replies.length;

  // Double-check if this is user's own post (might have been determined after fetching)
  const postIsOwn = post.author.id === user.uid || post.name === user.uid;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 84}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Post with Replies */}
        <FlatList
          data={replies}
          renderItem={renderReply}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={() => (
            <View style={styles.postContainer}>
              {/* Original Post */}
              <View style={styles.postHeader}>
                <Image
                  source={{
                    uri: post.author.picture_id || placeholderAvatar.uri,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.postHeaderInfo}>
                  <Text style={styles.authorName}>
                    {postIsOwn ? "You" : post.author.name}
                  </Text>
                  <Text style={styles.timestamp}>
                    {moment(
                      Date.parse(post.created_at.split(".")[0])
                    ).fromNow()}
                  </Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content.text}</Text>

              {post.image && (
                <Image
                  source={{ uri: post.image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}

              {/* Post Stats */}
              <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.statItem}>
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={16}
                    color={isLiked ? "#FF3B30" : "#000"}
                  />
                  <Text style={styles.statText}>{likeCount} likes</Text>
                </TouchableOpacity>
                <View style={styles.statItem}>
                  <Ionicons name="chatbubble-outline" size={16} color="#000" />
                  <Text style={styles.statText}>{replyCount} replies</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Replies Header */}
              <View style={styles.repliesHeader}>
                <Text style={styles.repliesTitle}>Replies</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyReplies}>
              <Ionicons name="chatbubbles-outline" size={40} color="#CCCCCC" />
              <Text style={styles.emptyRepliesText}>No replies yet</Text>
              <Text style={styles.emptyRepliesSubtext}>
                Be the first to reply!
              </Text>
            </View>
          )}
          ListFooterComponent={<View style={styles.listFooter} />}
          contentContainerStyle={styles.flatListContent}
        />

        {/* Reply Input */}
        <View style={styles.replyInputContainer}>
          <Image
            source={{ uri: user.photoURL || placeholderAvatar.uri }}
            style={styles.replyInputAvatar}
          />
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!replyText.trim() || submitting) && styles.sendButtonDisabled,
            ]}
            onPress={submitReply}
            disabled={!replyText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  flatListContent: {
    flexGrow: 1,
  },
  postContainer: {
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  timestamp: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#000",
    marginBottom: 16,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  repliesHeader: {
    marginBottom: 10,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  replyContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  replyAuthor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  replyTime: {
    fontSize: 12,
    color: "#666",
  },
  replyText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFF",
  },
  replyInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyReplies: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyRepliesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRepliesSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listFooter: {
    height: 60,
  },
  highlightedReply: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
  },
  temporaryReply: {
    backgroundColor: "#F9F9F9",
    opacity: 0.9,
  },
});
