import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

export default function IdDocumentScreen() {
  const router = useRouter();

  const handleContinue = () => {
    // Implement logic or navigation for after ID document is scanned/uploaded
    router.push('/registerNFC'); // Replace with your actual route
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header at the top */}
      <View style={styles.header}>
        <Text style={styles.title}>ID Document</Text>
        <Text style={styles.subtitle}>Scan user's identification documents</Text>
      </View>

      {/* Center container for the document box */}
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.documentBox} activeOpacity={0.8}>
          <Text style={styles.documentPlaceholderText}>Tap to Scan / Upload Document</Text>
        </TouchableOpacity>
      </View>

      {/* Button at the bottom */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 60, // Similar horizontal padding as your other screens
  },
  header: {
    marginTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentBox: {
    width: screenWidth * 0.7,
    height: screenWidth,
    borderWidth: 2,
    borderColor: '#aaa',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentPlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  continueButton: {
    width: screenWidth * 0.7,
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
