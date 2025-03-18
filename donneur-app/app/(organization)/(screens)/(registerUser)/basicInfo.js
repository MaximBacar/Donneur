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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './registerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function BasicInfoScreen() {
  const router = useRouter();
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
        fn: firstName,
        ln: lastName,
        dob: isoDate
      });

      const response = await fetch('https://api.donneur.ca/create_receiver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format date as dd-mm-yyyy
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      setDob(formattedDate);
      setDobError('');
    }
  };

  const handleDobInputChange = (text) => {
    setDob(text);
    
    // Clear error if field is empty or valid
    if (!text.trim() || validateDate(text)) {
      setDobError('');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // New function to handle the calendar icon click
  const handleCalendarIconPress = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Content area with header and form */}
          <View style={styles.content}>
            <View style={styles.header}>
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
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialIcons name="date-range" size={24} color="#007AFF" />
                </TouchableOpacity>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  // Content area: header and form with horizontal padding
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  header: {
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