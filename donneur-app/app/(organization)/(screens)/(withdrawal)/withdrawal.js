import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

const screenWidth = Dimensions.get('window').width;

export default function WithdrawalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNavigate = () => {
    router.push('/qrcode');
  };

  const handleGoBack = () => {
    router.back();
  };

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
          setUserID(id);
          router.push('/idConfirmation');
        } else {
          Alert.alert('No NDEF data found');
        }
      } catch (error) {
        console.warn('Error reading NFC:', error);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Withdrawal</Text>
          <Text style={styles.subtitle}>Begin a new withdrawal</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={readNfc}>
          <MaterialCommunityIcons
            name="nfc"
            size={28}
            color="#007AFF"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Scan NFC Card</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <TouchableOpacity style={styles.button} onPress={handleNavigate}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={28}
            color="#007AFF"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flex: 1,                   // fill remaining space
    justifyContent: 'center',  // center vertically
    alignItems: 'center',      // center horizontally
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  button: {
    flexDirection: 'row',      // align icon and text in a row
    width: screenWidth * 0.8,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  icon: {
    marginRight: 10,
    color: '#22222',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  orText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 10,
  },
});
