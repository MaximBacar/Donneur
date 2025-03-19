import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './registerContext';

const screenWidth = Dimensions.get('window').width;

import { BACKEND_URL } from '../../../../constants/backend';
import { useAuth } from '../../../../context/authContext';

export default function UserEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { userID } = useUser();
  const {token} = useAuth();


  const handleContinue = async () => {
    try {
      const body = JSON.stringify({
        receiver_id: userID,
        email: email,
      });
      const response = await fetch(`${BACKEND_URL}/receiver/set_email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        },
        body:body,
      });
    
      const result = await response.json();
      console.log(result);
      router.push('/idPicture');
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handleSkip = () => {
    router.push('/idPicture');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content container */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.subtitle}>
            Enter the receiver's email address
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@domain.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 60,
    paddingTop: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },
  buttonsContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 60,
  },
  continueButton: {
    width: screenWidth * 0.7,
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    width: screenWidth * 0.7,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
