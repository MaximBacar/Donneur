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

import { useRouter } from 'expo-router';

export default function AddFriendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const insets = useSafeAreaInsets();


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
    router.push('./readFriendCode')
    
  };
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
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
        <Text style={styles.subtitle}>
          Scan your friend's NFC card or QR Code to add them
        </Text>

        {/* NFC Button */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={readNfc}
        >
          <Ionicons name="scan" size={24} color="#000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Scan NFC Card</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        {/* QR Button */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={onPressScanQRCode}
        >
          <Ionicons name="qr-code" size={24} color="#000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginTop: '50%',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
  },
});