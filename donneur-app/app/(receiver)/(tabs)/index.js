import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LineChart } from "react-native-chart-kit";
import QRCode from 'react-native-qrcode-svg';
import { BACKEND_URL } from "../../../constants/backend";

// Import UI components and constants
import IconSymbol from "../../../components/ui/IconSymbol";
import { Colors } from "../../../constants/colors";

// Import your auth context and Firebase config
import { useAuth } from "../../../context/authContext";
import { database } from '../../../config/firebase';

const screenWidth = Dimensions.get("window").width;

// Chart configuration for react-native-chart-kit
const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(104, 112, 118, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#ffffff"
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, donneurID } = useAuth();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  // State management
  const [userInfo, setUserInfo] = useState(null);
  const [userBalance, setBalance] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  // Handle refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserInfo(), fetchBalance(), fetchFriendsCount(), fetchTransactions()]);
    setRefreshing(false);
  }, [user, donneurID, token]);
  

  const fetchFriendsCount = async () => {
    try{
      let url = `${BACKEND_URL}/friend/get`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      
      const data      = await response.json();
      let friends = data.friends

      console.log(friends.length);
      
      setFriendsCount(friends.length);
      
    } catch (error) {
      console.error("Error fetching friends count:", error);
      setFriendsCount(0);
    }
  };

  // Fetch user balance
  const fetchBalance = async () => {
    
    try {
      let url = `${BACKEND_URL}/receiver/get_balance`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setBalance(data);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchUserInfo = async () => { 
    try {
      let url = `${BACKEND_URL}/receiver/get`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch transaction data
  const fetchTransactions = async () => {
    try {
      setChartLoading(true);

            
      let url = `${BACKEND_URL}/transaction/get`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      const data = await response.json();
      
        
      const formattedTransactions = data.transactions.map(transaction => {
       
        const date = new Date(transaction.creation_date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        const isReceived = transaction.receiver_id === donneurID;
      
      
        let description;
      
        switch(transaction.type){
          case 'donation':
            description = 'Anonymous Donation';
            break;
          case 'withdrawal':
            description = `Withdrawal at ${transaction.receiver_id}`;
            break;
          case 'send':
            description = isReceived ? `Payment received from ${transaction.sender_id}` : `Payment sent to ${transaction.sender_id}`
            break;
        }
          
        return {
          id: transaction.id,
          description: description,
          date: formattedDate,
          timestamp: formattedTime,
          amount: isReceived ? transaction.amount : -transaction.amount,
          type: isReceived ? 'deposit' : 'withdrawal',
          status: transaction.confirmed ? 'completed' : 'pending',
          category: transaction.type || 'transfer',
          reference: transaction.id,
          raw: transaction,
          rawDate: date // Add the actual date object for chart processing
        };
      });
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setChartLoading(false);
    }
  };

  // Process transaction data for chart
  const chartData = useMemo(() => {
    if (transactions.length === 0) {
      // Default empty data based on time range
      if (timeRange === 'week') {
        return {
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              data: [0, 0, 0, 0, 0, 0, 0],
              color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ["Transactions"]
        };
      } else if (timeRange === 'month') {
        // Generate labels for last 30 days, showing only every 5th day for readability
        const emptyMonthData = Array(6).fill(0);
        const monthLabels = Array(6).fill('').map((_, i) => `Day ${i * 5 + 1}`);
        return {
          labels: monthLabels,
          datasets: [
            {
              data: emptyMonthData,
              color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ["Transactions"]
        };
      } else { // year
        const emptyYearData = Array(12).fill(0);
        const yearLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          labels: yearLabels,
          datasets: [
            {
              data: emptyYearData,
              color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: ["Transactions"]
        };
      }
    }
    
    const today = new Date();
    let timePoints = [];
    let labels = [];
    let dataPoints = [];
    
    if (timeRange === 'week') {
      // Get the last 7 days
      timePoints = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i)); // Start from 6 days ago
        return date;
      });
      
      // Format day labels
      labels = timePoints.map(date => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      // Initialize data array with zeros
      dataPoints = Array(7).fill(0);
      
      // Group transactions by day
      transactions.forEach(transaction => {
        if (!transaction.rawDate) return;
        
        // Check if transaction falls within last 7 days
        for (let i = 0; i < 7; i++) {
          const dayStart = new Date(timePoints[i]);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date(timePoints[i]);
          dayEnd.setHours(23, 59, 59, 999);
          
          if (transaction.rawDate >= dayStart && transaction.rawDate <= dayEnd) {
            // Add the transaction amount (could be positive or negative)
            dataPoints[i] += transaction.amount;
            break;
          }
        }
      });
    } else if (timeRange === 'month') {
      // Last 30 days, grouped into 6 segments (5 days each) for readability
      const numberOfPoints = 6;
      const daysPerPoint = 5;
      
      // Create time points for each segment
      timePoints = Array.from({ length: numberOfPoints }, (_, i) => {
        const date = new Date(today);
        const daysBack = (numberOfPoints - 1 - i) * daysPerPoint;
        date.setDate(today.getDate() - daysBack);
        return date;
      });
      
      // Create labels showing date ranges
      labels = timePoints.map((date, i) => {
        if (i === numberOfPoints - 1) {
          return 'Now'; // Last point is current
        }
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${month} ${day}`;
      });
      
      // Initialize data points
      dataPoints = Array(numberOfPoints).fill(0);
      
      // Group transactions into the time segments
      transactions.forEach(transaction => {
        if (!transaction.rawDate) return;
        
        // Get date 30 days ago
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        // Check if transaction is within the last 30 days
        if (transaction.rawDate >= thirtyDaysAgo) {
          // Find which segment it belongs to
          for (let i = 0; i < numberOfPoints; i++) {
            // Calculate segment start date
            const segmentStart = new Date(today);
            segmentStart.setDate(today.getDate() - (numberOfPoints - i) * daysPerPoint);
            segmentStart.setHours(0, 0, 0, 0);
            
            // Calculate segment end date
            const segmentEnd = new Date(today);
            if (i < numberOfPoints - 1) {
              segmentEnd.setDate(today.getDate() - (numberOfPoints - i - 1) * daysPerPoint);
              segmentEnd.setHours(0, 0, 0, 0);
              segmentEnd.setMilliseconds(-1); // Just before midnight
            }
            
            if (transaction.rawDate >= segmentStart && 
                (i === numberOfPoints - 1 || transaction.rawDate < segmentEnd)) {
              dataPoints[i] += transaction.amount;
              break;
            }
          }
        }
      });
    } else { // year
      // Get data for each month in the past year
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthData = Array(12).fill(0);
      
      // Calculate start date (1 year ago)
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      // Get current month index
      const currentMonthIndex = today.getMonth();
      
      // Rearrange labels so that they start from a year ago
      labels = [];
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonthIndex + 1 + i) % 12;
        labels.push(monthLabels[monthIndex]);
      }
      
      // Group transactions by month
      transactions.forEach(transaction => {
        if (!transaction.rawDate) return;
        
        // Check if transaction is within the last year
        if (transaction.rawDate >= oneYearAgo) {
          // Calculate months difference
          const transactionMonth = transaction.rawDate.getMonth();
          const transactionYear = transaction.rawDate.getFullYear();
          const thisYear = today.getFullYear();
          
          let monthsAgo;
          if (transactionYear === thisYear) {
            monthsAgo = currentMonthIndex - transactionMonth;
          } else {
            // Transaction from previous year
            monthsAgo = (12 - transactionMonth) + currentMonthIndex;
          }
          
          // Ensure monthsAgo is in the correct range (0-11)
          if (monthsAgo >= 0 && monthsAgo < 12) {
            // Invert index since we want most recent last
            const dataIndex = 11 - monthsAgo;
            monthData[dataIndex] += transaction.amount;
          }
        }
      });
      
      dataPoints = monthData;
    }
    
    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Transactions"]
    };
  }, [transactions, timeRange]);

  // Initialize data fetching
  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchUserInfo();
      fetchFriendsCount();
      fetchTransactions();
      
      // Set interval to fetch balance every 30 seconds
      const interval = setInterval(() => {
        fetchBalance();
        fetchTransactions(); // Also refresh transactions periodically
      }, 30000);
      
      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [user, donneurID, token]);

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
            onPress={() => router.push("/(screens)/withdraw/withdraw")}
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
                  <Text style={[styles.walletDetailLabel, { width: 40 }]}>DOB:</Text>
                  <Text style={styles.walletDetailValue}>{dob}</Text>
                </View>
                <View style={styles.walletDetailRow}>
                  <Text style={[styles.walletDetailLabel, { width: 100 }]}>Member since:</Text>
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
            onPress={() => router.push("/(friends)/friends")}
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
                <Text style={styles.actionSubtitle}>{friendsCount} friends</Text>
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
            <View style={styles.chartHeaderRow}>
              <Text style={styles.cardTitle}>Activity Overview</Text>
              <Animated.View 
                style={styles.timeRangeSelector}
                entering={FadeInDown.delay(450).duration(600).springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    timeRange === 'week' && styles.timeRangeButtonActive
                  ]}
                  onPress={() => setTimeRange('week')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    timeRange === 'week' && styles.timeRangeButtonTextActive
                  ]}>Week</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    timeRange === 'month' && styles.timeRangeButtonActive
                  ]}
                  onPress={() => setTimeRange('month')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    timeRange === 'month' && styles.timeRangeButtonTextActive
                  ]}>Month</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.timeRangeButton,
                    timeRange === 'year' && styles.timeRangeButtonActive
                  ]}
                  onPress={() => setTimeRange('year')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeRangeButtonText,
                    timeRange === 'year' && styles.timeRangeButtonTextActive
                  ]}>Year</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            
            <Text style={styles.cardSubtitle}>
              {timeRange === 'week' ? 'Weekly' : 
               timeRange === 'month' ? 'Monthly' : 'Yearly'} transactions summary
            </Text>
            
            {chartLoading ? (
              <Animated.View 
                style={styles.chartLoadingContainer}
                entering={FadeIn}
                exiting={FadeOut}
              >
                <ActivityIndicator size="small" color={Colors.light.tint} />
                <Text style={styles.loadingChartText}>Loading chart data...</Text>
              </Animated.View>
            ) : transactions.length === 0 ? (
              <Animated.View 
                style={styles.noDataContainer}
                entering={FadeIn}
                exiting={FadeOut}
              >
                <Text style={styles.noDataText}>No transaction data available</Text>
              </Animated.View>
            ) : (
              <Animated.View
                key={`chart-${timeRange}`}
                entering={FadeIn.duration(350)}
                exiting={FadeOut.duration(200)}
                layout={Layout.springify()}
              >
                <LineChart
                  data={chartData}
                  width={screenWidth - 64}
                  height={280}
                  chartConfig={chartConfig}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  formatYLabel={(value) => `$${parseInt(value)}`}
                />
              </Animated.View>
            )}
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
            <QRCode
              value={'https://give.donneur.ca/'+donneurID}
              size={200}
              color="black"
              backgroundColor="white"
            />
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
    paddingBottom: 16,
  },
  
  // Balance Display Styles
  balanceContainer: {
    alignItems: "center",
    marginTop: 48,
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
    alignItems: "center", // Ensure vertical alignment
  },
  walletDetailLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    width: 100, // Fixed width instead of marginRight for proper alignment
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
    marginTop: 4,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 1,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  timeRangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.icon,
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
  },
  chartLoadingContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingChartText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.icon,
  },
  noDataContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: "center",
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
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 0,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
});