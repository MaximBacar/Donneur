import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './withdrawalContext';
// import BackHeader from '../../../../components/header';

const screenWidth = Dimensions.get('window').width;

export default function WithdrawalAmountScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('0.00');

  const {userID, setWithdrawAmount} = useUser()

  // Example current balance
  const [availableBalance, setAvailableBalance] = useState(0);

  // Numeric keypad values
  const keypadValues = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'DEL'],
  ];


  useEffect(() => {
    if (userID){

      fetch(`https://api.donneur.ca/get_balance/${userID}`)
        .then((response) => response.json())
        .then((data) => {
          setAvailableBalance(data.balance);
        })
        .catch((err) => {
          console.log(err)
          
        });

    }
  }, [])

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

  const handleConfirm = () => {
    console.log(`Confirming withdrawal of $${amount}`);
    // Navigate to withdrawalConfirmation.js
    console.log('ammount', amount);
    console.log('')
    let amount_flt = parseFloat(amount);
    if (amount_flt <= availableBalance){
      setWithdrawAmount(amount_flt);
      router.push('/withdrawalConfirmation');
    }else{
      Alert.alert("Invalid amount", "insufficient funds");
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Optional BackHeader */}
      {/* <BackHeader title="" /> */}

      {/* Title and Subtitle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Withdrawal</Text>
        <Text style={styles.headerSubtitle}>Enter the amount to withdraw by the user</Text>
      </View>

      {/* Balance and Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.balanceText}>${availableBalance.toFixed(2)}</Text>
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
    marginTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
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
