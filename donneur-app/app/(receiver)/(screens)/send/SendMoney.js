import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Dimensions,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth, database } from '../../../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const keypadButtonSize = width / 4;

export default function SendMoney() {
  const { friend_db_id } = useLocalSearchParams();
  const router = useRouter();
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [friendData, setFriendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [showingNote, setShowingNote] = useState(false);

  useEffect(() => {
    if (friend_db_id) {
      fetchUserData(friend_db_id);
    }
  }, [friend_db_id]);

  async function fetchUserData(uid) {
    try {
      const res = await fetch(`https://api.donneur.ca/get_user?uid=${uid}`);
      const data = await res.json();
      setFriendData(data);
    } catch (err) {
      console.error('Error fetching friend data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = () => {
    // We'll implement the API call here later
    console.log('Sending amount:', amount, 'to:', friend_db_id, 'Note:', note);
    alert(`Money sent successfully! (This is just a placeholder - no real transaction)`);
    router.back();
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    
    // Only allow one decimal point
    if (key === '.' && amount.includes('.')) {
      return;
    }
    
    // Don't allow more than 2 decimal places
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2 && key !== 'backspace') {
      return;
    }
    
    // Maximum amount (prevent ridiculously large numbers)
    if (amount.replace('.', '').length >= 8 && key !== 'backspace' && key !== '.') {
      return;
    }
    
    // Don't allow leading zeros (unless it's "0.")
    if (amount === '0' && key !== '.' && key !== 'backspace') {
      setAmount(key);
      return;
    }
    
    setAmount(prev => prev + key);
  };

  const formatDisplayAmount = (value) => {
    if (!value) return '0.00';
    
    // Ensure proper decimal format
    let formatted = value;
    if (!value.includes('.')) {
      formatted = value + '.00';
    } else {
      const parts = value.split('.');
      if (parts[1].length === 0) {
        formatted = value + '00';
      } else if (parts[1].length === 1) {
        formatted = value + '0';
      }
    }
    
    return formatted;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!friendData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Could not load friend data.</Text>
      </View>
    );
  }

  // Format name: first name + first letter of last name (if exists)
  const displayName = friendData.last_name 
    ? `${friendData.first_name} ${friendData.last_name[0]}.`
    : friendData.first_name;

  // Build the profile picture URL (if available)
  const pictureUrl = friendData.picture_id 
    ? `https://api.donneur.ca/image/${friendData.picture_id}`
    : null;

  const isValidAmount = amount && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <Text style={styles.headerTitle}></Text>

      </View>

      {/* Recipient */}
      <View style={styles.recipientContainer}>
        <View style={styles.avatarContainer}>
          {pictureUrl ? (
            <>
              {imageLoading && (
                <ActivityIndicator
                  style={styles.imageLoading}
                  size="small"
                  color="#22c55e"
                />
              )}
              <Image
                source={{ uri: pictureUrl }}
                style={styles.avatar}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            </>
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Text style={styles.placeholderInitial}>{friendData.first_name?.[0]}</Text>
            </View>
          )}
        </View>
        <Text style={styles.recipientName}>{displayName}</Text>
      </View>

      {/* Amount Display */}
      <View style={styles.amountDisplayContainer}>
        <Text style={styles.currencySymbol}>$</Text>
        <Text style={styles.amountText}>
          {amount ? formatDisplayAmount(amount) : '0.00'}
        </Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('1')}
          >
            <Text style={styles.keypadButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('2')}
          >
            <Text style={styles.keypadButtonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('3')}
          >
            <Text style={styles.keypadButtonText}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('4')}
          >
            <Text style={styles.keypadButtonText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('5')}
          >
            <Text style={styles.keypadButtonText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('6')}
          >
            <Text style={styles.keypadButtonText}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('7')}
          >
            <Text style={styles.keypadButtonText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('8')}
          >
            <Text style={styles.keypadButtonText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('9')}
          >
            <Text style={styles.keypadButtonText}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('.')}
          >
            <Text style={styles.keypadButtonText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('0')}
          >
            <Text style={styles.keypadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.keypadButton} 
            onPress={() => handleKeyPress('backspace')}
          >
            <Ionicons name="backspace-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Send Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          disabled={!isValidAmount}
          onPress={handleSend}
        >
          <LinearGradient
  colors={['#1a3a5f', '#0d2440', '#061325']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.payButton}
>
  <Text style={styles.payButtonText}>Pay ${amount}</Text>
  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.payButtonIcon} />
</LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4b5563',
  },
  imageLoading: {
    position: 'absolute',
    zIndex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  amountDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '400',
    color: '#000',
    marginRight: 4,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#000',
  },
  noteContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  noteInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 40,
  },
  keypadContainer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  keypadButton: {
    width: keypadButtonSize - 24,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    backgroundColor: '#f9f9f9',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#1a3a5f', // Dark navy blue (fallback for gradient)
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  payButtonIcon: {
    marginLeft: 4,
  }
});

// For the gradient button, you'll need to use LinearGradient component:
// Replace your standard payButton with this component where needed:
/*

*/