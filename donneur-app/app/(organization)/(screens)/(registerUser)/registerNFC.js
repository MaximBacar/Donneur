import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { useUser } from './registerContext';



const screenWidth = Dimensions.get('window').width;

export default function RegisterNfcCardScreen() {
  const router = useRouter();

  const [isWriting, setIsWriting] = useState(false);

  const { userID } = useUser();

  useEffect(() => {
    NfcManager.start();
    return () => {
      NfcManager.stop();
    };
  }, []);

  const handleWriteNfc = () => {
    // TODO: Implement NFC writing logic
    console.log('Write NFC Card pressed');
  };

  const writeNfcTag = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      setIsWriting(true);
      const isNfcEnabled = await NfcManager.isEnabled();
      if (!isNfcEnabled) {
        Alert.alert('Error', 'NFC is not enabled on this device.');
        return;
      }
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const message = Ndef.encodeMessage([
        Ndef.uriRecord('https://give.donneur.ca/'+userID)
      ]);

      if (message) {
        await NfcManager.ndefHandler.writeNdefMessage(message);
        Alert.alert('Success', 'Data written to NFC tag!');
      } else {
        Alert.alert('Error', 'Failed to encode message.');
      }
    } catch (err) {
      console.warn('Error writing to NFC:', err);
      Alert.alert('Error', 'Failed to write NFC tag.');
    } finally {
      setIsWriting(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

  const handleFinish = () => {
    // Navigate or finalize the process
    console.log('Finish pressed');
    router.replace('/registrationConfirmation'); // or wherever you want to navigate
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content container for padding */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Register NFC Card</Text>
          <Text style={styles.subtitle}>Write user data into an empty card</Text>
        </View>

        {/* Center Container */}
        <View style={styles.centerContainer}>
          <TouchableOpacity style={styles.nfcButton} onPress={writeNfcTag}>
            <MaterialCommunityIcons
              name="nfc"
              size={28}
              color="#007AFF"
              style={styles.nfcIcon}
            />
            <Text style={styles.nfcButtonText}>Write NFC Card</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Finish Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Content container for horizontal padding
  content: {
    flex: 1,
    paddingHorizontal: 60,
  },
  header: {
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcButton: {
    width: screenWidth * 0.7,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nfcIcon: {
    marginRight: 8,
  },
  nfcButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bottomContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  finishButton: {
    width: screenWidth * 0.7,
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
