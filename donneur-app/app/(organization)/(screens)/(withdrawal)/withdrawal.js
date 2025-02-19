import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackHeader from '../../../../components/header';


const screenWidth = Dimensions.get('window').width;

export default function WithdrawalScreen() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/idConfirmation');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <BackHeader title="" /> */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Withdrawal</Text>
          <Text style={styles.subtitle}>Begin a new withdrawal</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNavigate}>
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
  content: {
    flex: 1,                   // fill remaining space
    justifyContent: 'center',  // center vertically
    alignItems: 'center',      // center horizontally
    paddingHorizontal: 20,
  },
  header: {
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
