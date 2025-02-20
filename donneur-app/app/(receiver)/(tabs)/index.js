import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Import your auth context
import { useAuth } from "../../../context/authContext";

const screenWidth = Dimensions.get("window").width;

// Define your chart's HTML with ApexCharts integration
const chartHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=0.6, maximum-scale=0.6">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <style>
      body, html { margin: 0; padding: 0; }
      #chart {
        background: #f2f2f2;
        border-radius: 10px;
      }
    </style>
  </head>
  <body>
    <div id="chart"></div>
    <script>
      var options = {
        series: [{
          name: 'series1',
          data: [31, 40, 28, 51, 42, 109, 100]
        }],
        chart: {
          height: 350,
          type: 'area',
          toolbar: { show: false },
          zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        xaxis: {
          categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        },
        tooltip: { x: { format: 'dd/MM/yy HH:mm' } },
      };
      var chart = new ApexCharts(document.querySelector("#chart"), options);
      chart.render();
    </script>
  </body>
</html>
`;

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // New state to hold the fetched user info from the API.
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);

  // Fetch user data when the auth user is available.
  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        try {
          const res = await fetch(
            `https://api.donneur.ca/get_user?uid=${user.uid}`
          );
          const data = await res.json();
          setUserInfo(data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUserInfo();
    }
  }, [user]);

  // While user info is loading, you can show a loader or fallback UI.
  if (loadingUser) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  // Use the fetched data for the balance, name, and other wallet information.
  const balance = userInfo ? userInfo.balance : 0;
  const fullName = userInfo
    ? `${userInfo.first_name} ${userInfo.last_name}`
    : "";
  const dob = userInfo ? userInfo.dob : "";
  const memberSince = userInfo
    ? new Date(userInfo.creation_date).toLocaleDateString()
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Cash Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceLabel}>Cash balance</Text>
        </View>

        {/* Row of Buttons: Receive / Withdraw */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.receiveButton}
            onPress={() => router.push("/(screens)/receive/receive")}
          >
            <Ionicons
              name="arrow-down"
              size={12}
              color="#222"
              style={styles.buttonIcon}
            />
            <Text style={styles.receiveButtonText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawButton}>
            <Ionicons
              name="arrow-up"
              size={12}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Card – Gradient */}
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={[styles.walletCard, { width: screenWidth - 32 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.walletInfo}>
            <Text style={styles.walletTitle}>Donneur Wallet</Text>
            <Text style={styles.walletSubtitle}>{fullName}</Text>
            <Text style={styles.walletOther}>
              DOB: {dob}{"\n"}Member since: {memberSince}
            </Text>
          </View>
          <View style={styles.walletBalanceContainer}>
            {/* QR Code Icon at Top Right */}
            <TouchableOpacity
              onPress={() => setShowQRCode(true)}
              style={styles.qrIconContainer}
            >
              <Ionicons name="qr-code" size={28} color="#fff" />
            </TouchableOpacity>
            {/* Balance info at Bottom Right */}
            <View style={styles.balanceInfo}>
              <Text style={styles.walletBalanceLabel}>Balance</Text>
              <Text style={styles.walletBalance}>${balance.toFixed(2)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Friends Button */}
        <TouchableOpacity
          style={styles.friendsButton}
          onPress={() => router.push("/(screens)/friends/friends")}
        >
          <View style={styles.friendsButtonContent}>
            <Ionicons
              name="people-outline"
              size={20}
              color="#222"
              style={styles.friendsIcon}
            />
            <Text style={styles.friendsText}>Friends: 0</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#222"
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        {/* History Chart */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Activity</Text>
          <WebView
            originWhitelist={["*"]}
            source={{ html: chartHtml }}
            style={{ width: "100%", height: 250 }}
            scrollEnabled={false}
          />
        </View>

        {/* Past Transactions Button */}
        <TouchableOpacity
          style={styles.pastTransactionButton}
          onPress={() => router.push("/(screens)/transactions/past")}
        >
          <View style={styles.friendsButtonContent}>
            <Ionicons
              name="bar-chart-outline"
              size={20}
              color="#222"
              style={styles.friendsIcon}
            />
            <Text style={styles.friendsText}>Past Transactions</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#222"
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>
         {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © Donneur
        </Text>
      </View>
      </ScrollView>


      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your QR Code</Text>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>QR Code Placeholder</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQRCode(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  /* ==========================
     NEW SECTION FOR BALANCE
     ========================== */
  balanceContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
    marginTop: 12,
  },
  withdrawButton: {
    backgroundColor: "#222222",
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 32,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  receiveButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 32,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  buttonIcon: {
    marginRight: 6,
  },
  withdrawButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  receiveButtonText: {
    fontSize: 14,
    color: "#222222",
    fontWeight: "600",
    textAlign: "center",
  },
  /* ==========================
     WALLET CARD SECTION
     ========================== */
  walletCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  walletOther: {
    fontSize: 14,
    color: "#fff",
  },
  walletBalanceContainer: {
    width: 80,
    height: 80,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  qrIconContainer: {},
  balanceInfo: {
    alignItems: "flex-end",
  },
  walletBalanceLabel: {
    fontSize: 12,
    color: "#fff",
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  /* ==========================
     FRIENDS BUTTON & PAST TRANSACTIONS BUTTON
     ========================== */
  friendsButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    borderColor: "#333333",
    backgroundColor: "#FFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  pastTransactionButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#FFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  friendsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  friendsIcon: {
    marginRight: 8,
  },
  friendsText: {
    flex: 1,
    fontSize: 12,
    color: "#222",
    fontWeight: "600",
  },
  chevronIcon: {
    marginLeft: 8,
  },
  /* ==========================
     HISTORY, CARDS, & OTHERS
     ========================== */
  historyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 8,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    flex: 1,
    margin: 4,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  fullWidthCard: {
    backgroundColor: "#fff",
    margin: 8,
    borderRadius: 10,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  moneyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  linkButton: {
    marginTop: 4,
  },
  linkButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
  chartPlaceholder: {
    marginTop: 10,
    backgroundColor: "#EEE",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: "#999",
  },
  /* ==========================
     MODAL STYLES
     ========================== */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  qrPlaceholderText: {
    color: "#999",
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
  },
/* ==========================
     FOOTER
     ========================== */
     footer: {
      borderTopWidth: 1,
      borderTopColor: "#ddd",
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: "#fff",
    },
    footerText: {
      fontSize: 12,
      color: "#666",
    },
  });
