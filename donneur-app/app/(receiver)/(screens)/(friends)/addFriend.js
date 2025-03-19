import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  View,
  StatusBar
} from 'react-native';
// import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/authContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../../constants/colors';

import { useRouter } from 'expo-router';

export default function AddFriendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const insets = useSafeAreaInsets();
  const { fromFriends } = router.params || {};


  const readNfc = async () => {
    try {
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        Alert.alert('NFC not supported on this device');
        return;
      }
      
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log('NFC Tag:', tag);

      if (tag?.ndefMessage) {
        const message = tag.ndefMessage[0]; // Get first record
        const decoded = Ndef.text.decodePayload(message.payload);

        let id = decoded.split("donneur.ca/")[1];
        setNewFriendID(id);
        router.push('/confirmAddFriend');
      } else {
        Alert.alert('No NDEF data found');
      }
    } catch (error) {
      console.warn('Error reading NFC:', error);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  const handleNFC = () => {

  }
  const handleGoBack = () => {
    navigation.goBack();
  };

  const onPressScanQRCode = async () => {
    router.push({
      pathname: './readFriendCode',
      params: { fromFriends }
    });
  };
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Friend</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <Text style={styles.subtitle}>
            Add a friend by scanning their NFC card or QR Code
          </Text>
        </View>

        {/* NFC Button */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={readNfc}
        >
          <LinearGradient
            colors={['#0070BA', '#1546A0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name="scan" size={28} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Scan NFC Card</Text>
            <Text style={styles.actionDescription}>
              Hold your phone near your friend's NFC card
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        {/* QR Button */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onPressScanQRCode}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name="qr-code" size={28} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Scan QR Code</Text>
            <Text style={styles.actionDescription}>
              Scan your friend's QR code to connect
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 24,
    flex: 1,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionCard: {
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
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginVertical: 16,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  scanAgainButton: {
    alignSelf: 'center',
    marginTop: 20,
    overflow: 'hidden',
    borderRadius: 16,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
});