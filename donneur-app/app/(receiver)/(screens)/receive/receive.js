import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../../../context/authContext'; // adjust the path as needed
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/colors';

export default function ReceiveScreen() {
  const router = useRouter();
  const { user, donneurID } = useAuth();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive Donations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subtitle}>Select a method to receive donations</Text>

        <View style={styles.optionsContainer}>
          {/* NFC Card Option */}
          <View style={styles.optionCard}>
            <LinearGradient
              colors={['#0070BA', '#1546A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <MaterialCommunityIcons name="nfc" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>NFC Card</Text>
              <Text style={styles.optionDescription}>
                Present your NFC card to someone wishing to send you money
              </Text>
            </View>
          </View>

          {/* QR Code Option */}
          <View style={styles.optionCard}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons name="qr-code" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>QR Code</Text>
              <Text style={styles.optionDescription}>
                Display this QR code for senders to scan with their smartphone
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrCodeSection}>
          <Text style={styles.yourCodeLabel}>Your unique code</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={'https://give.donneur.ca/'+donneurID}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>
        </View>

        {/* "Got it!" Button */}
        <TouchableOpacity 
          style={styles.gotItButton} 
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gotItGradient}
          >
            <Text style={styles.gotItButtonText}>Got it!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  contentContainer: {
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  qrCodeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  yourCodeLabel: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  gotItButton: {
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 24,
    overflow: 'hidden',
    width: '80%',
  },
  gotItGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  gotItButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});