import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { useUser } from './withdrawalContext';
import { useAuth } from '../../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BACKEND_URL } from '../../../../constants/backend';

export default function WithdrawalConfirmationScreen() {
  const router = useRouter();
  const [animationFinished, setAnimationFinished] = useState(false);
  const insets = useSafeAreaInsets();

  const {userID, withdrawAmount} = useUser();
  const { user, donneurID, token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('userid',userID);
    console.log('w_a',withdrawAmount);
    if (userID){
      const body = JSON.stringify({
        amount: withdrawAmount,
        receiver_id: userID
      });

      fetch(`https://api.donneur.ca/transaction/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' // Important: Expecting JSON
        },
        body: body
      })
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
        })
        .catch((err) => {
          console.log(err)
          setLoading(false);
        });
    }
  }, []);

  // Once the confirmation animation finishes, wait 1 second then navigate to the dashboard
  useEffect(() => {
    if (animationFinished && !loading) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, animationFinished, router]);

  const handleGoBack = () => {
    router.push('/');
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
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Animation Container */}
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../../../../assets/confirmed.json')}
          autoPlay
          loop={false}
          style={styles.animation}
          onAnimationFinish={() => setAnimationFinished(true)}
        />
        {animationFinished && (
          <Text style={styles.successText}>Withdrawal Successful</Text>
        )}
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
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 100,
    height: 100,
  },
  successText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: 'green',
  },
});
