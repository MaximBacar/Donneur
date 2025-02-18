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

export default function IdPictureScreen() {
  const router = useRouter();

  const handleContinue = () => {
    // Implement your logic or navigation for after the picture is taken/uploaded
    router.push('(organization)/(screens)/registerUser/idDocument'); // Replace with your actual route
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header at the top */}
      <View style={styles.header}>
        <Text style={styles.title}>ID Picture</Text>
        <Text style={styles.subtitle}>Take user's identification picture</Text>
      </View>

      {/* Center container for the image box */}
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.imageBox} activeOpacity={0.8}>
          <Text style={styles.imagePlaceholderText}>Tap to Upload / Take Picture</Text>
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
    paddingHorizontal: 60,  // Horizontal padding like your other screens
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
  // This container takes up the remaining space, so the image box stays in the center
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBox: {
    width: screenWidth * 0.7,
    height: screenWidth,
    borderWidth: 2,
    borderColor: '#aaa',
    borderStyle: 'dashed',  // dotted/dashed border style
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
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
