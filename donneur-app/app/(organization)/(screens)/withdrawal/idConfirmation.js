import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function IdConfirmationScreen() {
  const router = useRouter();

  // Replace with real data or props
  const profilePhoto = 'https://via.placeholder.com/100';
  const name = 'RIBERY FRANCK';
  const birthDate = '2002-03-24';
  const address = '1234 RUE DE LA PAIX';

  const handleConfirm = () => {
    console.log('Identity confirmed');
    // Navigate to withdrawalAmount.js
    router.push('/withdrawal/withdrawalAmount');
  };

  const handleRefuse = () => {
    console.log('Transaction refused');
    // Navigate to /(tabsOrg)/dashboard
    router.push('/(tabsOrg)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top portion (Header + Identity Info) */}
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ID Confirmation</Text>
            <Text style={styles.subtitle}>Confirm the identity for the withdrawal</Text>
          </View>

          {/* Identity Info */}
          <View style={styles.identityContainer}>
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
            <View style={styles.infoColumn}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.detail}>Date of birth: {birthDate}</Text>
              <Text style={styles.detail}>Known address: {address}</Text>
            </View>
          </View>
        </View>

        {/* Bottom portion (Prompt + Buttons) */}
        <View>
          <Text style={styles.prompt}>
            Confirm the identity of the user by asking for their government issued identification.
          </Text>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Identity</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRefuse}>
            <Text style={styles.refuseText}>Refuse Transaction</Text>
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
  content: {
    flex: 1,
    justifyContent: 'space-between', // Splits top/bottom
    paddingBottom: 20,               // Extra spacing from bottom
    paddingHorizontal: 40,           // More padding on the sides
    paddingTop: 40,
  },
  // Header
  header: {
    marginBottom: 20,
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
  // Identity Info
  identityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 15,
    backgroundColor: '#ccc',
  },
  infoColumn: {
    flexShrink: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  // Prompt
  prompt: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    marginTop: 30, // Add some top spacing from identity info
  },
  // Confirm Button
  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Refuse Text
  refuseText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
