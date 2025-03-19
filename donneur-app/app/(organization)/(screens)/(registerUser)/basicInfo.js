import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './registerContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BACKEND_URL } from '../../../../constants/backend';
import { useAuth } from '../../../../context/authContext';

const screenWidth = Dimensions.get('window').width;

export default function BasicInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lastNameRef = useRef(null);
  const dobRef = useRef(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation state
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const {token} = useAuth()

  const { setUserID } = useUser();

  

  const validateDate = (dateString) => {
    // Validate date format dd-mm-yyyy
    const regex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
    const year = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    
    // Check if the date is valid and not in the future
    return date.getDate() === day && 
           date.getMonth() === month && 
           date.getFullYear() === year &&
           date <= new Date();
  };

  const validateForm = () => {
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }

    if (!dob) {
      setDobError('Date of birth is required');
      isValid = false;
    } else if (!validateDate(dob)) {
      setDobError('Enter a valid date in format dd-mm-yyyy');
      isValid = false;
    } else {
      setDobError('');
    }

    return isValid;
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Convert dd-mm-yyyy to ISO format for API
      const [day, month, year] = dob.split('-');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      const body = JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        dob: dob
      });

      const response = await fetch(`${BACKEND_URL}/receiver/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'remove-later'
        },
        body: body,
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(result);
        setUserID(result.receiver_id);
        router.push('/userEmail');
      } else {
        Alert.alert('Registration Error', result.message || 'An error occurred during registration');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Connection Error', 'Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDobInputChange = (text) => {
    // Remove non-digit characters
    const cleanedText = text.replace(/\D/g, '');
  
    // Auto-insert dashes for dd-mm-yyyy format
    let formattedText = cleanedText;
    if (cleanedText.length > 2) {
      formattedText = `${cleanedText.slice(0, 2)}-${cleanedText.slice(2)}`;
    }
    if (cleanedText.length > 4) {
      formattedText = `${formattedText.slice(0, 5)}-${formattedText.slice(5, 9)}`;
    }
  
    // Limit length to 10 characters (dd-mm-yyyy)
    setDob(formattedText.slice(0, 10));
  };
  

  const handleCancel = () => {
    router.back();
  };

  // New function to handle the calendar icon click
  const handleCalendarIconPress = () => {
    setShowDatePicker(true);
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
        <Text style={styles.headerTitle}>Registration</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Content area with section title and form */}
          <View style={styles.content}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.title}>Registration</Text>
              <Text style={styles.subtitle}>Begin the registration of a new user</Text>
            </View>


            <View style={styles.form}>
              <Text style={styles.label}>First name*</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, firstNameError ? styles.inputError : null]}
                  placeholder="John"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (text.trim()) setFirstNameError('');
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current.focus()}
                  blurOnSubmit={false}
                  autoCorrect={false}
                />
              </View>
              {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}

              <Text style={styles.label}>Last name*</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  ref={lastNameRef}
                  style={[styles.input, lastNameError ? styles.inputError : null]}
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (text.trim()) setLastNameError('');
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => dobRef.current.focus()}
                  blurOnSubmit={false}
                  autoCorrect={false}
                />
              </View>
              {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}

              <Text style={styles.label}>Date of Birth* (dd-mm-yyyy)</Text>
              <View style={styles.dobContainer}>
                <View style={[
                  styles.inputContainer, 
                  styles.dobInputContainer,
                  dobError ? styles.inputContainerError : null
                ]}>
                  {/* Modified to make the calendar icon touchable */}
                  <TouchableOpacity onPress={handleCalendarIconPress}>
                    <MaterialIcons name="calendar-today" size={20} color="#666" style={styles.inputIcon} />
                  </TouchableOpacity>
                  <TextInput
                    ref={dobRef}
                    style={styles.input}
                    placeholder="31-12-1990"
                    value={dob}
                    onChangeText={handleDobInputChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>
              
              {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}

              {showDatePicker && (
                <DateTimePicker
                  value={dob && validateDate(dob) 
                    ? new Date(dob.split('-')[2], dob.split('-')[1] - 1, dob.split('-')[0])
                    : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>
        </ScrollView>

        {/* Buttons container fixed at the bottom */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.disabledButton]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= Styles =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    padding: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  // Content area: section title and form with horizontal padding
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  dobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  calendarButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainerError: {
    borderColor: '#ff3b30',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  dateText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  // Buttons container positioned at the bottom
  buttonsContainer: {
    paddingHorizontal: 60,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  continueButton: {
    width: screenWidth * 0.7,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: screenWidth * 0.7,
    borderWidth: 1,
    borderColor: '#8e8e93',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#8e8e93',
    fontSize: 16,
    fontWeight: '600',
  },
});