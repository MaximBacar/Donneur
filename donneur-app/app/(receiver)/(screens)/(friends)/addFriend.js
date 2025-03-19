import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  View,
  StatusBar
} from 'react-native';
import { Camera, CameraType, requestCameraPermissionsAsync } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/authContext';
import { addDoc, collection } from 'firebase/firestore';
import { database } from '../../../../config/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

export default function AddFriendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const insets = useSafeAreaInsets();

  // Request camera permissions when the component mounts.
  useEffect(() => {
    (async () => {
      const { status } = await requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      console.log("Camera permission granted:", status === 'granted');
    })();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // This function is called when a QR code is scanned.
  // The encoded string from the QR code is available in the "data" property.
  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    console.log(`QR code scanned, data: ${data}`);

    if (!user) {
      Alert.alert("Error", "No current user found.");
      setIsScanning(false);
      return;
    }

    try {
      
      Alert.alert("Success", "Friend request sent!");
      navigation.navigate('Friends');
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to send friend request.");
    } finally {
      setIsScanning(false);
    }
  };

  const onPressScanQRCode = async () => {
    router.push('./readFriendCode')
    
  };

  // If we're in scanning mode, render the camera view.
  if (isScanning && hasPermission) {
    return (
      <View style={styles.container}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          type={CameraType.back}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          ratio="16:9"
          barCodeScannerSettings={{
            barCodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsScanning(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.scanFrame} />

            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </Camera>
      </View>
    );
  }

  // Normal view when not scanning.
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Friend</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Scan your friend's NFC card or QR Code to add them
        </Text>

        {/* NFC Button */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => console.log('Scan NFC Card pressed')}
        >
          <Ionicons name="scan" size={24} color="#000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Scan NFC Card</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        {/* QR Button */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={onPressScanQRCode}
        >
          <Ionicons name="qr-code" size={24} color="#000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginTop: '50%',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
  },
});