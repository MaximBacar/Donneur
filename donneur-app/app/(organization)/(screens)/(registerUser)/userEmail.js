import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './registerContext';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

import { BACKEND_URL } from '../../../../constants/backend';
import { useAuth } from '../../../../context/authContext';

export default function UserEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userID } = useUser();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Email validation function
  const validateEmail = (email) => {
    if (!email) return true; // Email is optional, so empty is valid
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    // Clear previous error
    setEmailError('');
    
    // Validate email if provided
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
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
          'ngrok-skip-browser-warning': 'remove-later'
        },
        body: body,
      });
    
      const result = await response.json();
      console.log(result);
      
      if (response.ok) {
        router.push('/idPicture');
      } else {
        Alert.alert('Error', result.message || 'An error occurred while updating email.');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/idPicture');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Content container */}
      <View style={styles.content}>
        <View style={styles.sectionTitleContainer}>
          <LinearGradient
            colors={['#f5f5f7', '#e8e8e8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="email" size={24} color="#555" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Contact Information</Text>
              <Text style={styles.subtitle}>
                Enter the receiver's email address (optional)
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputContainer,
            emailError ? styles.inputContainerError : email ? styles.inputContainerSuccess : null
          ]}>
            <MaterialIcons 
              name="email" 
              size={20} 
              color={emailError ? "#ff3b30" : email ? "#4CAF50" : "#666"} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="example@domain.com"
              placeholderTextColor="#AAA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (validateEmail(text)) setEmailError('');
              }}
            />
            {email && validateEmail(email) ? (
              <FontAwesome name="check-circle" size={18} color="#4CAF50" style={styles.validationIcon} />
            ) : null}
          </View>
          {emailError ? (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={14} color="#ff3b30" />
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          ) : null}
          
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              Adding an email address allows the receiver to get important notifications.
              This field is optional and can be skipped.
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          disabled={isLoading}
          onPress={handleContinue}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#f5f5f7', '#e8e8e8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.continueButton, isLoading && styles.disabledButton]}
          >
            {isLoading ? (
              <ActivityIndicator color="#555" size="small" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#555" style={styles.buttonIcon} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitleContainer: {
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#424242',
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerSuccess: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  inputContainerError: {
    borderColor: '#ff3b30',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  validationIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 2,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
    marginLeft: 6,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F5FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButton: {
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  skipButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#8e8e93',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    color: '#8e8e93',
    fontSize: 16,
    fontWeight: '600',
  },
});
