import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../../../context/authContext'; // adjust the path as needed

export default function ReceiveScreen() {
  const router = useRouter();
  const { user, donneurID } = useAuth();

  // Use the user's uid as the unique QR code value.
  const uniqueValue = user ? user.uid : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Receive</Text>
          <Text style={styles.subtitle}>How to receive donations</Text>
        </View>

        {/* NFC Card Section */}
        <Text style={styles.sectionHeader}>NFC Card</Text>
        <Text style={styles.sectionBody}>
          To receive donations, present your NFC card to someone wishing to send you money.
        </Text>

        {/* QR Code Section */}
        <Text style={styles.sectionHeader}>QR Code</Text>
        <Text style={styles.sectionBody}>
          Alternatively, you can display a QR code. Senders can scan this code with their smartphone to add you.
        </Text>

        {/* "Your code" Label */}
        <Text style={styles.yourCodeLabel}>Your code</Text>

        {/* QR Code generated using react-native-qrcode-svg */}
        <View style={styles.qrContainer}>
          <QRCode
            value={'https://give.donneur.ca/'+donneurID}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>

        {/* Export to Camera Roll Button */}
        <TouchableOpacity style={styles.exportButton} onPress={() => console.log('Export tapped')}>
          <Text style={styles.exportButtonText}>Export to Camera Roll</Text>
        </TouchableOpacity>

        {/* "Got it!" Button */}
        <TouchableOpacity style={styles.gotItButton} onPress={() => router.back()}>
          <Text style={styles.gotItButtonText}>Got it!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '300',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: '#333',
  },
  yourCodeLabel: {
    marginTop: 20,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '500',
    alignItems: 'center',
    alignSelf: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  exportButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  exportButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  gotItButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 24,
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
