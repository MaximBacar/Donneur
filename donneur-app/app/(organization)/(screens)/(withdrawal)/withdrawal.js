import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { useUser } from './withdrawalContext'

export default function WithdrawalScreen() {
  const router = useRouter();

  const {setUserID} = useUser()

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
      
      {/* Header */}
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
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Select a withdrawal method</Text>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Option 1: NFC Card */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={readNfc}
          >
            <LinearGradient
              colors={['#007AFF', '#0056B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <MaterialCommunityIcons name="nfc" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Scan NFC Card</Text>
              <Text style={styles.optionDescription}>
                Use NFC technology to read the donor's card
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          {/* Option 2: QR Code */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleNavigate}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Scan QR Code</Text>
              <Text style={styles.optionDescription}>
                Scan the donor's QR code from their app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
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
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 8,
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
});
