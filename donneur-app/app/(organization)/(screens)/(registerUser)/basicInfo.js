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
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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

  // Handle date selection from the date picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      setDob(formattedDate);
      setDobError('');
    }
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
              <LinearGradient
                colors={['#f5f5f7', '#e8e8e8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
              >
                <View style={styles.headerIconContainer}>
                  <FontAwesome name="user-plus" size={24} color="#555" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.title}>New User Registration</Text>
                  <Text style={styles.subtitle}>Enter the basic information</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>First name*</Text>
              <View style={[
                styles.inputContainer,
                firstNameError ? styles.inputContainerError : null
              ]}>
                <MaterialIcons 
                  name="person" 
                  size={20} 
                  color={firstNameError ? "#ff3b30" : "#666"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#AAA"
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
              {firstNameError ? (
                <View style={styles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={14} color="#ff3b30" />
                  <Text style={styles.errorText}>{firstNameError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Last name*</Text>
              <View style={[
                styles.inputContainer,
                lastNameError ? styles.inputContainerError : null
              ]}>
                <MaterialIcons 
                  name="person" 
                  size={20} 
                  color={lastNameError ? "#ff3b30" : "#666"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  ref={lastNameRef}
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#AAA"
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
              {lastNameError ? (
                <View style={styles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={14} color="#ff3b30" />
                  <Text style={styles.errorText}>{lastNameError}</Text>
                </View>
              ) : null}

<Text style={styles.label}>Date of Birth*</Text>
<TouchableOpacity 
  style={[
    styles.inputContainer, 
    dobError ? styles.inputContainerError : null
  ]}
  onPress={handleCalendarIconPress}
  activeOpacity={0.7}
>
  <MaterialIcons 
    name="calendar-today" 
    size={20} 
    color={dobError ? "#ff3b30" : "#666"} 
    style={styles.inputIcon}
  />
  <Text style={[styles.input, !dob && {color: '#AAA'}]}>
    {dob || "DD-MM-YYYY"}
  </Text>
</TouchableOpacity>
{dobError ? (
  <View style={styles.errorContainer}>
    <FontAwesome name="exclamation-circle" size={14} color="#ff3b30" />
    <Text style={styles.errorText}>{dobError}</Text>
  </View>
) : null}

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
              
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={18} color="#555" />
                <Text style={styles.infoText}>
                  All information is securely stored and protected by our privacy policy.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Buttons container fixed at the bottom */}
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
  dobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dobInputContainer: {
    flex: 1,
  },
  calendarIconContainer: {
    padding: 8,
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
  // Buttons container positioned at the bottom
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
  cancelButton: {
    width: '100%',
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