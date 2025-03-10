import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Import UI components and constants
import IconSymbol from "../../../components/ui/IconSymbol";
import { Colors } from "../../../constants/colors";

// Import your auth context
import { useAuth } from "../../../context/authContext";

const screenWidth = Dimensions.get("window").width;

// Define your chart's HTML with ApexCharts integration
const chartHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=0.7, maximum-scale=0.7">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <style>
      body, html { 
        margin: 0; 
        padding: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      #chart {
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        padding: 8px;
      }
    </style>
  </head>
  <body>
    <div id="chart"></div>
    <script>
      var options = {
        series: [{
          name: 'Activity',
          data: [31, 40, 28, 51, 42, 109, 100]
        }],
        chart: {
          height: 320,
          type: 'area',
          toolbar: { show: false },
          zoom: { enabled: false },
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        colors: ['#0a7ea4'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.1,
            stops: [0, 90, 100]
          }
        },
        dataLabels: { enabled: false },
        stroke: { 
          curve: 'smooth',
          width: 3
        },
        grid: {
          borderColor: '#f1f1f1',
          row: {
            colors: ['transparent', 'transparent'],
            opacity: 0.5
          }
        },
        xaxis: {
          categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          labels: {
            style: {
              colors: '#687076',
              fontSize: '12px'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#687076',
              fontSize: '12px'
            },
            formatter: function(val) {
              return '$' + val.toFixed(0);
            }
          }
        },
        tooltip: { 
          x: { format: 'dd MMM' },
          style: {
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          },
          theme: 'light',
          marker: {
            show: true
          },
          y: {
            formatter: function(val) {
              return '$' + val.toFixed(2);
            }
          }
        },
        markers: {
          size: 5,
          colors: ['#0a7ea4'],
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: 7
          }
        }
      };
      var chart = new ApexCharts(document.querySelector("#chart"), options);
      chart.render();
    </script>
  </body>
</html>
`;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, donneurID } = useAuth();
  const insets = useSafeAreaInsets();

  // State management
  const [userInfo, setUserInfo] = useState(null);
  const [userBalance, setBalance] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserInfo(), fetchBalance()]);
    setRefreshing(false);
  }, [user, donneurID]);

  // Fetch user balance
  const fetchBalance = async () => {
    if (!user || !donneurID) return;
    
    try {
      const res = await fetch(
        `https://api.donneur.ca/get_balance/${donneurID}`
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch user info
  const fetchUserInfo = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(
        `https://api.donneur.ca/get_user?uid=${user.uid}`
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchUserInfo();
      
      // Set interval to fetch balance every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      
      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [user, donneurID]);

  // While user info is loading, show an enhanced loader
  if (loadingUser) {
    return (
      <SafeAreaView style={[styles.loadingContainer, {paddingTop: insets.top}]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Animated.View entering={FadeIn.duration(600)}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Use the fetched data for the balance, name, and other wallet information.
  const fullName = userInfo
    ? `${userInfo.first_name} ${userInfo.last_name}`
    : "";
  const dob = userInfo ? userInfo.dob : "";
  const memberSince = userInfo
    ? new Date(userInfo.creation_date).toLocaleDateString()
    : "";

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.tint]} />
        }
      >
        {/* Header Section with Balance Display */}
        <Animated.View 
          style={styles.balanceContainer}
          entering={FadeInDown.duration(600).springify()}
        >
          <Text style={styles.balanceValue}>${userBalance.toFixed(2)}</Text>
          <Text style={styles.balanceLabel}>Available Balance</Text>
        </Animated.View>

        {/* Action Buttons: Receive / Withdraw */}
        <Animated.View 
          style={styles.buttonsRow}
          entering={FadeInDown.delay(100).duration(600).springify()}
        >
          <TouchableOpacity
            style={styles.receiveButton}
            onPress={() => router.push("/(screens)/receive/receive")}
            activeOpacity={0.7}
          >
            <IconSymbol 
              name={Platform.OS === 'ios' ? 'arrow.down.circle.fill' : 'arrow-downward'} 
              size={20} 
              color={Colors.light.text} 
              style={styles.buttonIcon}
            />
            <Text style={styles.receiveButtonText}>Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.withdrawButton} 
            activeOpacity={0.7}
          >
            <IconSymbol 
              name={Platform.OS === 'ios' ? 'arrow.up.circle.fill' : 'arrow-upward'} 
              size={20} 
              color="#FFFFFF" 
              style={styles.buttonIcon}
            />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Wallet Card with Modern Gradient */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
        >
          <LinearGradient
            colors={[Colors.light.tint, "#4c669f", "#192f6a"]}
            style={[styles.walletCard, { width: screenWidth - 32 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.walletInfo}>
              <Text style={styles.walletTitle}>Donneur Wallet</Text>
              <Text style={styles.walletSubtitle}>{fullName}</Text>
              <View style={styles.walletDetails}>
                <View style={styles.walletDetailRow}>
                  <Text style={styles.walletDetailLabel}>DOB:</Text>
                  <Text style={styles.walletDetailValue}>{dob}</Text>
                </View>
                <View style={styles.walletDetailRow}>
                  <Text style={styles.walletDetailLabel}>Member since:</Text>
                  <Text style={styles.walletDetailValue}>{memberSince}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.walletBalanceContainer}>
              {/* QR Code Button at Top Right */}
              <TouchableOpacity
                onPress={() => setShowQRCode(true)}
                style={styles.qrIconContainer}
                activeOpacity={0.7}
              >
                <Ionicons name="qr-code" size={28} color="#fff" />
              </TouchableOpacity>
              
              {/* Balance info at Bottom Right */}
              <View style={styles.balanceInfo}>
                <Text style={styles.walletBalanceLabel}>Balance</Text>
                <Text style={styles.walletBalance}>${userBalance.toFixed(2)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Action Cards Section */}
        <Animated.View 
          style={styles.actionsSection}
          entering={FadeInDown.delay(300).duration(600).springify()}
        >
          {/* Friends Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(screens)/(friends)/friends")}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  name={Platform.OS === 'ios' ? 'person.2.fill' : 'group'}
                  size={24}
                  color={Colors.light.tint}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Friends</Text>
                <Text style={styles.actionSubtitle}>0 friends</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.light.icon}
              />
            </View>
          </TouchableOpacity>

          {/* Past Transactions Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(screens)/(pastTransactions)/pastTransactions")}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="bar-chart-outline"
                  size={24}
                  color={Colors.light.tint}
                />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Transactions</Text>
                <Text style={styles.actionSubtitle}>View all transactions</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.light.icon}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Activity Chart */}
        <Animated.View
          style={styles.historyCardContainer}
          entering={FadeInDown.delay(400).duration(600).springify()}
        >
          <View style={styles.historyCard}>
            <Text style={styles.cardTitle}>Activity Overview</Text>
            <Text style={styles.cardSubtitle}>Weekly transactions summary</Text>
            <WebView
              originWhitelist={["*"]}
              source={{ html: chartHtml }}
              style={styles.chartWebView}
              scrollEnabled={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.chartLoadingContainer}>
                  <ActivityIndicator size="small" color={Colors.light.tint} />
                </View>
              )}
            />
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Donneur
          </Text>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRCode(false)}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your QR Code</Text>
              <Text style={styles.modalSubtitle}>Scan to receive money</Text>
            </View>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>QR Code</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQRCode(false)}
              activeOpacity={0.7}
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
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
  },
  
  // Main Container Styles
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  
  // Balance Display Styles
  balanceContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 4,
    fontWeight: "500",
  },
  
  // Action Buttons Styles
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: Colors.light.text,
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 160,
  },
  receiveButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: 160,
  },
  buttonIcon: {
    marginRight: 8,
  },
  withdrawButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  receiveButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Wallet Card Styles
  walletCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  walletSubtitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    marginBottom: 12,
    opacity: 0.9,
  },
  walletDetails: {
    marginTop: 4,
  },
  walletDetailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  walletDetailLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    width: 100,
  },
  walletDetailValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  walletBalanceContainer: {
    height: 100,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  qrIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceInfo: {
    alignItems: "flex-end",
  },
  walletBalanceLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  walletBalance: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  
  // Action Cards Section
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F8FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  
  // Chart Section
  historyCardContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 16,
  },
  chartWebView: {
    width: "100%", 
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
  },
  chartLoadingContainer: {
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#F6F8FA",
    borderRadius: 16,
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 240,
    height: 240,
    backgroundColor: "#FFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },
  qrPlaceholderText: {
    color: Colors.light.icon,
    fontSize: 16,
    fontWeight: "500",
  },
  modalCloseButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Footer
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
});
