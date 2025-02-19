import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import IconSymbol from '../../../components/ui/IconSymbol';
import { WebView } from 'react-native-webview';

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
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false  // Disables zoom on click
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    type: 'datetime',
    categories: [
      "2018-09-19T00:00:00.000Z",
      "2018-09-19T01:30:00.000Z",
      "2018-09-19T02:30:00.000Z",
      "2018-09-19T03:30:00.000Z",
      "2018-09-19T04:30:00.000Z",
      "2018-09-19T05:30:00.000Z",
      "2018-09-19T06:30:00.000Z"
    ]
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm'
    }
  },
};
var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();

    </script>
  </body>
</html>
`;

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/send-money')}>
              <IconSymbol size={28} name="arrow.up.circle.fill" color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('(receiver)/(screens)/friends')}>
              <IconSymbol size={28} name="person.2.fill" color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Card – Full Width & Compact */}
        <View style={styles.walletCard}>
          <Text style={styles.cardTitle}>Wallet</Text>
          <Text style={styles.moneyText}>$17.42</Text>
        </View>

        {/* History Chart directly below the Wallet */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>History</Text>
          <Text style={styles.moneyText}>$32.42</Text>
          <WebView
            originWhitelist={['*']}
            source={{ html: chartHtml }}
            style={{ width: '100%', height: 250 }}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  scrollContainer: { 
    paddingBottom: 20 
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 20, 
    paddingVertical: 10,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '600' 
  },
  headerIcons: { 
    flexDirection: 'row' 
  },
  iconButton: { 
    marginLeft: 15 
  },
  walletCard: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 10,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  historyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 10,
    padding: 16,
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
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4 
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
});