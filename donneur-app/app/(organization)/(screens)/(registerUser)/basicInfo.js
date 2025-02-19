import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './registerContext';

const screenWidth = Dimensions.get('window').width;

export default function BasicInfoScreen() {
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState(''); 


  const { setUserID } = useUser();

  const handleContinue = async () => {

    try{
      const body = JSON.stringify({
        fn: firstName,
        ln: lastName,
        dob: dob
      });

      const response = await fetch('https://api.donneur.ca/create_receiver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Important: Expecting JSON
        },
        body:body,
      });

      const result = await response.json();
      console.log(result);
      setUserID(result.receiver_id);



      router.push('/userEmail');
    }catch(error){
      console.log(error);
    }
  
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content area with header and form */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.subtitle}>Begin the registration of a new user</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>First name*</Text>
          <TextInput
            style={styles.input}
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Last name*</Text>
          <TextInput
            style={styles.input}
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Date of Birth*</Text>
          <TextInput
            style={styles.input}
            placeholder="June 14 1971"
            value={dob}
            onChangeText={setDob}
          />
        </View>
      </View>

      {/* Buttons container fixed at the bottom */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ================= Styles =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Content area: header and form with horizontal padding
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  // Buttons container positioned at the bottom
  buttonsContainer: {
    paddingHorizontal: 60,
    paddingBottom: 20,
    alignItems: 'center',
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
  cancelButton: {
    width: screenWidth * 0.7,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
  },
});
