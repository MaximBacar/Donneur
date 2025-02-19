import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

export default function WithdrawalConfirmationScreen() {
  const router = useRouter();
  const [animationFinished, setAnimationFinished] = useState(false);

  // Once the confirmation animation finishes, wait 2 seconds then navigate to the dashboard
  useEffect(() => {
    if (animationFinished) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationFinished, router]);

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
