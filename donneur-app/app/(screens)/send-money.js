import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const userPhoto = 'https://via.placeholder.com/100'; // Replace with real photo URL
const userName = 'Jacob B.';
const initialAmount = '0.00'; // Default amount

export default function SendMoneyScreen() {
  const [amount, setAmount] = useState(initialAmount);
  const [hasEdited, setHasEdited] = useState(false); // Track if user has started editing

  // Handle numeric keypad presses
  const handleKeyPress = (key) => {
    setHasEdited(true); // Mark that user has started editing

    if (key === 'DEL') {
      // Delete last character or reset to "0.00" if empty
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0.00'));
      return;
    }

    if (key === '.') {
      // Prevent multiple decimal points
      if (amount.includes('.')) return;
    }

    if (!hasEdited) {
      // If it's the first input, replace "0.00" entirely
      setAmount(key === '.' ? '0.' : key);
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleApplePay = () => {
    console.log(`Sending $${amount} to ${userName} via Apple Pay`);
  };

  // Build the keypad layout
  const keypadValues = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'DEL'],
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
        <Text style={styles.userName}>{userName}</Text>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>${amount}</Text>
        <Text style={styles.subText}>will be sent</Text>
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

      {/* Apple Pay Button */}
      <TouchableOpacity style={styles.applePayButton} onPress={handleApplePay}>
        <Text style={styles.applePayText}> Pay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Optional: get screen width for responsive sizing
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  keypadContainer: {
    width: screenWidth * 0.8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  keypadButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  keypadButtonText: {
    fontSize: 22,
    fontWeight: '500',
  },
  applePayButton: {
    width: screenWidth * 0.6,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
  },
  applePayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
