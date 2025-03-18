import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import IconSymbol from "../../../components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/colors";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function DashboardScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good day");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateYAnim = useState(new Animated.Value(20))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Stats for dashboard
  const shelterStats = {
    available: 42,
    occupied: 23,
    announcements: 34,
    messages: 354,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ============== WELCOME SECTION ============== */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.orgName}>Shelter Organization</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              router.push("/(organization)/(screens)/(editProfile)")
            }
          >
            <LinearGradient
              colors={["#4c669f", "#3b5998", "#192f6a"]}
              style={styles.profileGradient}
            >
              <IconSymbol name="person.fill" size={22} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ============== ORGANIZATION INFO CARD ============== */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
        >
          <LinearGradient
            colors={["#0a7ea4", "#005b84"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topCard}
          >
            <View style={styles.topCardContent}>
              <View>
                <Text style={styles.cardTitle}>Shelter Status</Text>
                <Text style={styles.orgAddress} numberOfLines={1}>
                  1234 Maple Street, Hometown
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {shelterStats.available + shelterStats.occupied}
                  </Text>
                  <Text style={styles.statLabel}>Total Capacity</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{shelterStats.occupied}</Text>
                  <Text style={styles.statLabel}>Current Occupancy</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{shelterStats.available}</Text>
                  <Text style={styles.statLabel}>Available Spots</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => {
                  // Share logic here
                }}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={20}
                  color="#ffffff"
                />
                <Text style={styles.shareButtonText}>Share Status</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ============== QUICK ACTIONS ============== */}
        <Animated.View
          style={[
            styles.quickActionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionsGrid}>
            {/* Register User */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(registerUser)")}
            >
              <LinearGradient
                colors={["#5e72e4", "#324cdd"]}
                style={styles.quickActionIcon}
              >
                <IconSymbol
                  name="person.badge.plus"
                  size={24}
                  color="#ffffff"
                />
              </LinearGradient>
              <Text style={styles.quickActionText}>Register User</Text>
            </TouchableOpacity>

            {/* Withdrawal */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(screens)/(withdrawal)")}
            >
              <LinearGradient
                colors={["#fb6340", "#f56036"]}
                style={styles.quickActionIcon}
              >
                <IconSymbol
                  name="arrow.down.circle.fill"
                  size={24}
                  color="#ffffff"
                />
              </LinearGradient>
              <Text style={styles.quickActionText}>Withdrawal</Text>
            </TouchableOpacity>

            {/* Messages - Replaced Get User Data */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() =>
                router.push("/(organization)/(screens)/(inboxOrg)/inbox")
              }
            >
              <LinearGradient
                colors={["#11cdef", "#1da1f2"]}
                style={styles.quickActionIcon}
              >
                <IconSymbol name="message.fill" size={24} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Messages</Text>
            </TouchableOpacity>

            {/* Announcements - Replaced Settings */}
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() =>
                router.push("/(organization)/(screens)/(socialOrg)/social")
              }
            >
              <LinearGradient
                colors={["#f3a4b5", "#fe7096"]}
                style={styles.quickActionIcon}
              >
                <IconSymbol name="megaphone.fill" size={24} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Announcements</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ============== NOTIFICATIONS SECTION ============== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notificationsContainer}>
            {/* Notification 1 */}
            <TouchableOpacity style={styles.notificationItem}>
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: "#ffeae9" },
                ]}
              >
                <IconSymbol name="megaphone.fill" size={20} color="#FF6A55" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>New Announcement</Text>
                <Text style={styles.notificationDesc}>
                  Community dinner scheduled for tonight at 6:00 PM
                </Text>
                <Text style={styles.notificationTime}>2 hours ago</Text>
              </View>
            </TouchableOpacity>

            {/* Notification 2 */}
            <TouchableOpacity style={styles.notificationItem}>
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: "#e8f7ff" },
                ]}
              >
                <IconSymbol name="person.2.fill" size={20} color="#36B3FC" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  New User Registered
                </Text>
                <Text style={styles.notificationDesc}>
                  John Smith has been registered successfully
                </Text>
                <Text style={styles.notificationTime}>Yesterday</Text>
              </View>
            </TouchableOpacity>

            {/* Notification 3 */}
            <TouchableOpacity style={styles.notificationItem}>
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: "#f0fdf4" },
                ]}
              >
                <IconSymbol
                  name="arrow.down.circle.fill"
                  size={20}
                  color="#22C55E"
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  Withdrawal Completed
                </Text>
                <Text style={styles.notificationDesc}>
                  $50.00 withdrawal processed for Sarah Johnson
                </Text>
                <Text style={styles.notificationTime}>2 days ago</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============== STATISTICS SECTION ============== */}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================== STYLES ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    paddingBottom: 30,
  },

  // ===== Header Section =====
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  orgName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#94a3b8",
  },
  profileButton: {
    marginLeft: 12,
  },
  profileGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== Top Card (Shelter Status) =====
  topCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  topCardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  orgAddress: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },

  // ===== Quick Actions =====
  quickActionsContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  quickActionButton: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },

  // ===== Section Styling =====
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "500",
  },

  // ===== Notifications Section =====
  notificationsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  notificationDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
