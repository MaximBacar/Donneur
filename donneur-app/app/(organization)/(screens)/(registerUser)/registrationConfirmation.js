import React, { useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegistrationConfirmationScreen() {
  const router = useRouter();

  // When the screen loads, wait 1 second then navigate to the dashboard.
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirmation</Text>
      </View>

      {/* Centered Success Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.successText}>User Registered Successfully</Text>
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
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'green',
  },
});
