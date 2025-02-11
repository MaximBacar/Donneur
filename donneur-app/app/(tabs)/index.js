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

// If you're using Expo Router:
import { useRouter } from 'expo-router';

// Update this import if `IconSymbol` is in a different directory
import IconSymbol from '../../components/ui/IconSymbol';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  // If you're using Expo Router:
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Title & Icon Buttons */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerIcons}>
            {/* Send Money Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/send-money')}
            >
              <IconSymbol size={28} name="arrow.up.circle.fill" color="#007AFF" />
              {/* <IconSymbol size={28} name="arrow-up-circle" color="#007AFF" /> */}

            </TouchableOpacity>
            {/* Friends Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/friends')}
            >
              <IconSymbol size={28} name="person.2.fill" color="#007AFF" />
              {/* <IconSymbol size={28} name="person" color="#007AFF" /> */}

            </TouchableOpacity>
          </View>
        </View>

        {/* Top Cards Row (Wallet + Donations Received) */}
        <View style={styles.row}>
          <View style={styles.cardLarge}>
            <Text style={styles.cardTitle}>Wallet</Text>
            <Text style={styles.moneyText}>$17.42</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>📈 Line Chart</Text>
            </View>
          </View>

          <View style={styles.cardLarge}>
            <Text style={styles.cardTitle}>Donations & Received</Text>
            <Text style={styles.cardValue}>16</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>🥧 Pie Chart</Text>
            </View>
          </View>
        </View>

        {/* Middle Cards Row 1 (Opportunities + Food & Sleep) */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Opportunities Near Me</Text>
            <Text style={styles.cardValue}>4</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>See more</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Food & Sleep availabilities</Text>
            <Text style={styles.cardValue}>11</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Open Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Middle Cards Row 2 (Friends Online + Donations) */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Friends online</Text>
            <Text style={styles.cardValue}>2</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Open Messages</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, styles.highlightCard]}>
            <Text style={styles.cardTitle}>Donations</Text>
            <Text style={[styles.moneyText, { fontSize: 28 }]}>$3.42</Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* History Card */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>History</Text>
          <Text style={styles.moneyText}>$32.42</Text>
          <View style={[styles.chartPlaceholder, { flexDirection: 'row' }]}>
            <View style={[styles.bar, { backgroundColor: 'purple', height: 40 }]} />
            <View style={[styles.bar, { backgroundColor: 'blue', height: 60 }]} />
            <View style={[styles.bar, { backgroundColor: 'orange', height: 30 }]} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    paddingBottom: 20, // Ensures content doesn't cut off at bottom
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // left title, right icons
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15, // space between icons
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    width: '100%',
  },
  cardLarge: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 10,
    padding: 16,
    minWidth: screenWidth * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 10,
    padding: 16,
    minWidth: screenWidth * 0.35,
  },
  highlightCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  moneyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  linkButton: {
    marginTop: 4,
  },
  linkButtonText: {
    fontSize: 14,
    color: '#007AFF',
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
    color: '#999',
  },
  historyCard: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 10,
    padding: 16,
  },
  bar: {
    width: 20,
    marginHorizontal: 2,
  },
});

