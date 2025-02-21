import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { useUser } from './withdrawalContext';
import { useAuth } from '../../../../context/authContext';

export default function WithdrawalConfirmationScreen() {
  const router = useRouter();
  const [animationFinished, setAnimationFinished] = useState(false);


  const {userID, withdrawAmount}    = useUser();
  const { user, donneurID }         = useAuth();
  const [loading, setLoading]       = useState(true);


  useEffect(() => {
    if (userID){

  
      const body = JSON.stringify({
        amount:   withdrawAmount,
        organization_id:   donneurID,
        id:  userID
      });

      fetch(`https://api.donneur.ca/get_id/${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Important: Expecting JSON
        },
        body:body
      })
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message); // Set error if the request fails
          setLoading(false);
        });

    }
  },[])

  // Once the confirmation animation finishes, wait 2 seconds then navigate to the dashboard
  useEffect(() => {
    if (animationFinished && !loading) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, animationFinished, router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirmation</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center', // centers the title horizontally
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
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
