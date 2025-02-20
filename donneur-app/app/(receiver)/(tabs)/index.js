import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

// Define your chart's HTML with ApexCharts integration
const chartHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=0.6, maximum-scale=0.6">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <style>
      body, html { margin: 0; padding: 0; }
      /* Set a light gray background and rounded corners for the chart container */
      #chart {
        background: #f2f2f2;
        border-radius: 10px;
        overflow: hidden;
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
  const [showQRCode, setShowQRCode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Cash Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceValue}>$0</Text>
          <Text style={styles.balanceLabel}>Cash balance</Text>
        </View>

        {/* Row of Buttons: Receive / Withdraw */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.balanceButton}
            onPress={() => router.push("/receive/receive")}
          >
            <Text style={styles.balanceButtonText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceButton}>
            <Text style={styles.balanceButtonText}>Withdraw</Text>
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
            <Text style={styles.walletSubtitle}>John</Text>
            <Text style={styles.walletOther}>Additional info</Text>
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
              <Text style={styles.walletBalance}>$17.42</Text>
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

        {/* Other Cards */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Donations & Received</Text>
            <Text style={styles.cardValue}>16</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>🥧 Pie Chart</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Opportunities Near Me</Text>
            <Text style={styles.cardValue}>4</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>See more</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Food & Sleep availabilities</Text>
            <Text style={styles.cardValue}>11</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Open Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Friends online</Text>
            <Text style={styles.cardValue}>2</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Open Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Width Donations Card */}
        <View style={styles.fullWidthCard}>
          <Text style={styles.cardTitle}>Donations</Text>
          <Text style={[styles.moneyText, { fontSize: 28 }]}>$3.42</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Details</Text>
          </TouchableOpacity>
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
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContainer: { 
    paddingBottom: 20 
  },
  /* ==========================
     NEW SECTION FOR BALANCE
     ========================== */
  balanceContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 12,
  },
  balanceButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderRadius: 32,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#989898',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 6,
  },
  balanceButtonText: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '600',
    textAlign: 'center',
  },
  /* ==========================
     WALLET CARD SECTION
     ========================== */
  walletCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  walletOther: {
    fontSize: 14,
    color: '#fff',
  },
  walletBalanceContainer: {
    width: 80,
    height: 80,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qrIconContainer: {
    // optional styling/padding
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  walletBalanceLabel: {
    fontSize: 12,
    color: '#fff',
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  /* ==========================
     FRIENDS BUTTON
     ========================== */
  friendsButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#989898',
    backgroundColor: '#FFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  friendsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  friendsIcon: {
    marginRight: 8,
  },
  friendsText: {
    flex: 1,
    fontSize: 12,
    color: '#222',
    fontWeight: '600',
  },
  chevronIcon: {
    marginLeft: 8,
  },
   /* ==========================
     HISTORY, CARDS, & OTHERS
     ========================== */
     historyCard: {
      backgroundColor: '#fff',
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 8,
      marginTop: 10,
    },
    card: {
      backgroundColor: '#fff',
      flex: 1,
      margin: 4,
      borderRadius: 10,
      padding: 16,
      alignItems: 'center',
    },
    fullWidthCard: {
      backgroundColor: '#fff',
      margin: 8,
      borderRadius: 10,
      padding: 16,
      width: '100%',
      alignItems: 'center',
    },
    cardTitle: { 
      fontSize: 20, 
      fontWeight: '600', 
      marginBottom: 8
    },
    cardValue: { 
      fontSize: 24, 
      fontWeight: 'bold', 
      marginBottom: 6, 
      color: '#333' 
    },
    moneyText: { 
      fontSize: 20, 
      fontWeight: 'bold', 
      color: '#333' 
    },
    linkButton: { 
      marginTop: 4 
    },
    linkButtonText: { 
      fontSize: 14, 
      color: '#007AFF' 
    },
    chartPlaceholder: {
      marginTop: 10,
      backgroundColor: '#EEE',
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartPlaceholderText: { 
      fontSize: 14, 
      color: '#999' 
    },
    /* ==========================
       MODAL STYLES
       ========================== */
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      width: '100%',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 16,
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      borderRadius: 10,
      backgroundColor: '#F2F2F2',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    qrPlaceholderText: {
      color: '#999',
      fontSize: 16,
    },
    modalCloseButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    modalCloseButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
  