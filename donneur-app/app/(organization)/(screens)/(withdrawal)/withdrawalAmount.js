import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './withdrawalContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function WithdrawalAmountScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('0.00');
  const insets = useSafeAreaInsets();

  const {userID, balance, setWithdrawAmount} = useUser();

  // Numeric keypad values
  const keypadValues = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'DEL'],
  ];

  const handleKeyPress = (key) => {
    setAmount((prevAmount) => {
      // Handle DELETE
      if (key === 'DEL') {
        // If we are down to 1 character or less, reset to "0.00"
        if (prevAmount.length <= 1) {
          return '0.00';
        } else {
          return prevAmount.slice(0, -1);
        }
      }

      // Prevent double decimals
      if (key === '.' && prevAmount.includes('.')) {
        return prevAmount; // ignore
      }

      // If we're at the default "0.00", replace it entirely with the new key
      if (prevAmount === '0.00') {
        return key === '.' ? '0.' : key;
      }

      // Otherwise, append the new key
      return prevAmount + key;
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    console.log(`Confirming withdrawal of $${amount}`);
    // Navigate to withdrawalConfirmation.js
    console.log('ammount', amount);

    let amount_flt = parseFloat(amount);
    if (amount_flt <= balance){
      setWithdrawAmount(amount_flt);
      router.push('/withdrawalConfirmation');
    }else{
      Alert.alert("Invalid amount", "insufficient funds");
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
        <Text style={styles.headerTitle}>Enter Amount</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Title and Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>Withdrawal</Text>
        <Text style={styles.headerSubtitle}>Enter the amount to withdraw by the user</Text>
      </View>

      {/* Balance and Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
        <Text style={styles.amountText}>${amount}</Text>
        <Text style={styles.amountLabel}>Withdrawal</Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {keypadValues.map((row, rowIndex) => (
          <View style={styles.keypadRow} key={rowIndex}>
            {row.map((key) => (
              <TouchableOpacity
                style={styles.keypadButton}
                key={key}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keypadButtonText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
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
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  titleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  amountSection: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  keypadContainer: {
    width: screenWidth * 0.8,
    marginTop: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  keypadButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  keypadButtonText: {
    fontSize: 22,
    fontWeight: '500',
  },
  confirmButton: {
    width: screenWidth * 0.6,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 30,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
