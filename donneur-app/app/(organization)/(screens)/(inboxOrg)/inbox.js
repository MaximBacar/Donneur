import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../context/authContext";

export default function Inbox() {
  const [chats, setChats] = useState([]);
  const [channels, setChannels] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, direct, channels
  const { user, userData } = useAuth();
  const router = useRouter();

  // ------------------------------------------------------
  // 1) Fetch Direct Messages + Channels from Firestore
  // ------------------------------------------------------
  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // ============================
      //      FETCH DIRECT MESSAGES
      // ============================
      console.log("user_idddd", user.uid);
      console.log("user_Data,", userData.name);
      const chatQuery = query(
        collection(database, "chat"),
        where("users", "array-contains", user.uid)
      );

      const unsubscribeChats = onSnapshot(
        chatQuery,
        async (snapshot) => {
          try {
            const chatList = await Promise.all(
              snapshot.docs.map(async (chatDoc) => {
                const chat = chatDoc.data();
                const otherUserId = chat.users.find(
                  (userId) => userId !== user.uid
                );

                // Get other user's name
                const otherUserName =
                  chat.userNames?.[otherUserId] || "Maxim Bacar";
                console.log("otherUserIDDD", otherUserId);

                const otherUserData = chat.userDetails?.[otherUserId] || null;
                console.log("Other User Data:", otherUserData);

                // Fetch the last message
                const messagesRef = collection(
                  database,
                  "chat",
                  chatDoc.id,
                  "messages"
                );
                const messagesQuery = query(
                  messagesRef,
                  orderBy("createdAt", "desc"),
                  limit(1)
                );
                const messagesSnapshot = await getDocs(messagesQuery);

                const lastMessageData = messagesSnapshot.docs[0]?.data();
                const lastMessage = lastMessageData?.text || "No messages yet";
                const createdAt = lastMessageData?.createdAt?.toDate() || null;
                const read = lastMessageData?.read || false;
                const sender =
                  lastMessageData?.user?._id === user.uid ? "You: " : "";

                // Check if message is unread
                const hasUnread =
                  !read && lastMessageData?.user._id !== user.uid;

                // Real-time listener for new/updated last message
                const unsubscribeMessages = onSnapshot(
                  messagesQuery,
                  (messagesSnapshot) => {
                    const message = messagesSnapshot.docs[0]?.data();
                    if (message) {
                      const updatedLastMessage =
                        message.text || "Media message";
                      const updatedCreatedAt =
                        message.createdAt?.toDate() || null;
                      const updatedRead = message?.read || false;
                      const updatedSender =
                        message?.user?._id === user.uid ? "You: " : "";

                      setChats((prevChats) =>
                        prevChats
                          .map((prevChat) =>
                            prevChat.id === chatDoc.id
                              ? {
                                  ...prevChat,
                                  lastMessage: updatedLastMessage,
                                  sender: updatedSender,
                                  createdAt: updatedCreatedAt,
                                  read: updatedRead,
                                  hasUnread:
                                    !updatedRead &&
                                    message.user._id !== user.uid,
                                }
                              : prevChat
                          )
                          .sort(
                            (a, b) =>
                              (b.createdAt?.getTime() || 0) -
                              (a.createdAt?.getTime() || 0)
                          )
                      );
                      applyCombinedFilters();
                    }
                  }
                );

                return {
                  id: chatDoc.id,
                  displayName: otherUserName,
                  lastMessage,
                  sender,
                  createdAt,
                  hasUnread,
                  unsubscribeMessages,
                  type: "direct",
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    otherUserName
                  )}&background=random&color=fff`,
                };
              })
            );

            // Sort direct messages by date
            const sortedChatList = chatList.sort(
              (a, b) =>
                (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
            );

            setChats(sortedChatList);
            setLoading(false);
            setRefreshing(false);
          } catch (error) {
            console.error("Error fetching chats:", error);
            setLoading(false);
            setRefreshing(false);
          }
        },
        (error) => {
          console.error("Error with Firestore snapshot (chats):", error);
          setLoading(false);
          setRefreshing(false);
        }
      );

      // ============================
      //         FETCH CHANNELS
      // ============================
      const channelsRef = collection(database, "channels");

      // Query A: user is in "members"
      const channelsQueryMembers = query(
        channelsRef,
        where("members", "array-contains", user.uid)
      );
      // Query B: user is "admin"
      const channelsQueryAdmin = query(
        channelsRef,
        where("admin", "==", user.uid)
      );

      // MEMBERS query
      const unsubscribeChannelsMembers = onSnapshot(
        channelsQueryMembers,
        async (snapshot) => {
          try {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === "removed") {
                setChannels((prev) =>
                  prev.filter((ch) => ch.id !== change.doc.id)
                );
                return;
              }
              const parsed = await parseChannelDoc(change.doc);
              setChannels((prev) => upsertChannel(prev, parsed));
            });
            setLoading(false);
            setRefreshing(false);
          } catch (error) {
            console.error("Error fetching member-based channels:", error);
            setLoading(false);
            setRefreshing(false);
          }
        },
        (error) => {
          console.error("Error with Firestore snapshot (members):", error);
          setLoading(false);
          setRefreshing(false);
        }
      );

      // ADMIN query
      const unsubscribeChannelsAdmin = onSnapshot(
        channelsQueryAdmin,
        async (snapshot) => {
          try {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === "removed") {
                setChannels((prev) =>
                  prev.filter((ch) => ch.id !== change.doc.id)
                );
                return;
              }
              const parsed = await parseChannelDoc(change.doc);
              setChannels((prev) => upsertChannel(prev, parsed));
            });
            setLoading(false);
            setRefreshing(false);
          } catch (error) {
            console.error("Error fetching admin-based channels:", error);
            setLoading(false);
            setRefreshing(false);
          }
        },
        (error) => {
          console.error("Error with Firestore snapshot (admin):", error);
          setLoading(false);
          setRefreshing(false);
        }
      );

      return () => {
        unsubscribeChats();
        unsubscribeChannelsMembers();
        unsubscribeChannelsAdmin();
        chats.forEach((c) => c.unsubscribeMessages?.());
        channels.forEach((ch) => ch.unsubscribeMessages?.());
      };
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // ------------------------------------------------------
  // Helper: upsert (add or update) one channel
  // ------------------------------------------------------
  function upsertChannel(prevChannels, newChannel) {
    let found = false;
    const updated = prevChannels.map((ch) => {
      if (ch.id === newChannel.id) {
        found = true;
        return {
          ...ch,
          ...newChannel,
          unsubscribeMessages:
            newChannel.unsubscribeMessages || ch.unsubscribeMessages,
        };
      }
      return ch;
    });
    if (!found) {
      updated.push(newChannel);
    }
    return updated.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  // ------------------------------------------------------
  // Helper function: parse each channelDoc + real-time lastMessage
  // ------------------------------------------------------
  const parseChannelDoc = async (channelDoc) => {
    const channel = channelDoc.data();
    const channelName = channel.name || "Unnamed Channel";
    const messagesRef = collection(
      database,
      "channels",
      channelDoc.id,
      "messages"
    );
    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const messagesSnapshot = await getDocs(messagesQuery);

    const lastMessageData = messagesSnapshot.docs[0]?.data();
    const lastMessage = lastMessageData?.text || "No messages yet";
    const createdAt =
      lastMessageData?.createdAt?.toDate() ||
      channel.createdAt?.toDate() ||
      null;
    const senderName = lastMessageData?.user?.displayName || "Unknown";
    const sender = lastMessageData ? `${senderName}: ` : "";
    const lastMessageTimestamp = lastMessageData?.createdAt?.toMillis();
    const userLastReadTimestamp = channel.lastRead?.[user.uid] || 0;
    const hasUnread =
      lastMessageTimestamp && lastMessageTimestamp > userLastReadTimestamp;

    const unsubscribeMessages = onSnapshot(messagesQuery, (snap) => {
      const msg = snap.docs[0]?.data();
      if (msg) {
        const updatedLastMessage = msg.text || "Media message";
        const updatedCreatedAt = msg.createdAt?.toDate() || null;
        const updatedSenderName = msg.user?.displayName || "Unknown";
        const updatedSender = `${updatedSenderName}: `;
        const newMessageTimestamp = msg.createdAt?.toMillis();
        const updatedHasUnread =
          newMessageTimestamp && newMessageTimestamp > userLastReadTimestamp;
        setChannels((prev) =>
          upsertChannel(prev, {
            id: channelDoc.id,
            lastMessage: updatedLastMessage,
            sender: updatedSender,
            createdAt: updatedCreatedAt,
            hasUnread: updatedHasUnread,
          })
        );
      }
    });

    return {
      id: channelDoc.id,
      displayName: channelName,
      memberCount: (channel.members || []).length,
      lastMessage,
      sender,
      createdAt,
      hasUnread,
      unsubscribeMessages,
      type: "channel",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        channelName
      )}&background=4A5568&color=fff`,
    };
  };

  // ------------------------------------------------------
  // Function to mark a channel as read when navigating to it
  // ------------------------------------------------------
  const markChannelAsRead = async (channelId) => {
    try {
      const messagesRef = collection(
        database,
        "channels",
        channelId,
        "messages"
      );
      const messagesQuery = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const lastMessage = messagesSnapshot.docs[0]?.data();
      if (lastMessage && lastMessage.createdAt) {
        const lastMessageTimestamp = lastMessage.createdAt.toMillis();
        const updateData = {
          [`lastRead.${user.uid}`]: lastMessageTimestamp,
        };
        const channelRef = doc(database, "channels", channelId);
        await updateDoc(channelRef, updateData);
        setChannels((prevChannels) =>
          prevChannels.map((channel) =>
            channel.id === channelId
              ? { ...channel, hasUnread: false }
              : channel
          )
        );
      }
    } catch (error) {
      console.error("Error marking channel as read:", error);
    }
  };

  // ------------------------------------------------------
  // 2) Combine chats & channels into a single list
  // ------------------------------------------------------
  const applyCombinedFilters = useCallback(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    let filteredChatsData = chats;
    let filteredChannelsData = channels;

    if (normalizedQuery) {
      filteredChatsData = chats.filter(
        (chat) =>
          chat.displayName.toLowerCase().includes(normalizedQuery) ||
          chat.lastMessage.toLowerCase().includes(normalizedQuery)
      );
      filteredChannelsData = channels.filter(
        (channel) =>
          channel.displayName.toLowerCase().includes(normalizedQuery) ||
          channel.lastMessage.toLowerCase().includes(normalizedQuery)
      );
    }

    if (activeTab === "direct") {
      filteredChannelsData = [];
    } else if (activeTab === "channels") {
      filteredChatsData = [];
    }

    const combined = [...filteredChatsData, ...filteredChannelsData].sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
    setCombinedData(combined);
  }, [chats, channels, searchQuery, activeTab]);

  // ------------------------------------------------------
  // 3) Fetch data on mount
  // ------------------------------------------------------
  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      chats.forEach((c) => c.unsubscribeMessages?.());
      channels.forEach((ch) => ch.unsubscribeMessages?.());
    };
  }, [fetchChats]);

  useEffect(() => {
    applyCombinedFilters();
  }, [chats, channels, searchQuery, activeTab, applyCombinedFilters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  const handleItemPress = (item) => {
    if (item.type === "direct") {
      router.push("/(inboxOrg)/chats2/" + item.id);
    } else if (item.type === "channel") {
      markChannelAsRead(item.id);
      router.push("/(inboxOrg)/channel2/" + item.id);
    }
  };

  const formatMessageDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const msgDate = new Date(date);
    if (msgDate.toDateString() === now.toDateString()) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    if (msgDate > weekAgo) {
      return msgDate.toLocaleDateString([], { weekday: "short" });
    }
    return msgDate.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Render each item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.avatar }}
        style={[styles.avatar, item.type === "channel" && styles.channelAvatar]}
      />
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {item.type === "direct"
              ? item.displayName
              : `# ${item.displayName}`}
          </Text>
          <Text style={styles.timestampText}>
            {formatMessageDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.previewContainer}>
          {item.type === "channel" && (
            <Text style={styles.memberCountText}>
              {item.memberCount === 1
                ? "1 member"
                : `${item.memberCount} members`}{" "}
              ·
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              item.type === "direct" && item.hasUnread
                ? styles.unreadText
                : null,
            ]}
            numberOfLines={1}
          >
            {item.sender}
            {item.lastMessage}
          </Text>
          {item.type === "direct" && item.hasUnread && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={
          activeTab === "channels"
            ? "people-outline"
            : activeTab === "direct"
            ? "chatbubble-ellipses-outline"
            : "chatbubble-ellipses-outline"
        }
        size={60}
        color="#ccc"
      />
      <Text style={styles.emptyText}>
        {activeTab === "channels"
          ? "No channels found"
          : activeTab === "direct"
          ? "No direct messages"
          : "No conversations yet"}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? "Try a different search term"
          : "Start a new conversation to begin messaging"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="people-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#8E8E93"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages and channels"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "direct" && styles.activeTab]}
            onPress={() => setActiveTab("direct")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "direct" && styles.activeTabText,
              ]}
            >
              Direct
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "channels" && styles.activeTab]}
            onPress={() => setActiveTab("channels")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "channels" && styles.activeTabText,
              ]}
            >
              Channels
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={combinedData}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={
              combinedData.length === 0 ? { flex: 1 } : styles.listContent
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007AFF"]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#E5E5EA",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#007AFF",
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  channelAvatar: {
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  timestampText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 4,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCountText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  messageText: {
    fontSize: 14,
    color: "#8E8E93",
    flex: 1,
  },
  unreadText: {
    color: "#000",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  channelUnreadIndicator: {
    backgroundColor: "#34C759",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
});
