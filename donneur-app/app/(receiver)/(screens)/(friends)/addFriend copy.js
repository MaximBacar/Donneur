import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  View
} from 'react-native';
import { Camera, CameraType, requestCameraPermissionsAsync } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/authContext';
import { addDoc, collection } from 'firebase/firestore';
import { database } from '../../../../config/firebase';

export default function AddFriendScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Request camera permissions when the component mounts.
  useEffect(() => {
    (async () => {
      const { status } = await requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      console.log("Camera permission granted:", status === 'granted');
    })();
  }, []);

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
      // For example, use the scanned encoded string to create a new friend request.
      const docRef = await addDoc(collection(database, 'friends'), {
        user1: user.uid,
        user2: data, // This is the encoded string from your generated QR code.
        u1: true,
        u2: false,
      });
      console.log("Friend request created with ID:", docRef.id);
      Alert.alert("Success", "Friend request sent!");
      navigation.navigate('Friends');
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to send friend request.");
    } finally {
      setIsScanning(false);
    }
  };

  // This function toggles the scanning mode. It also checks permissions.
  // const onPressScanQRCode = async () => {
  //   if (hasPermission === null) {
  //     Alert.alert('Requesting camera permission');
  //     const { status } = await requestCameraPermissionsAsync();
  //     setHasPermission(status === 'granted');
  //     if (status === 'granted') {
  //       setIsScanning(true);
  //       setScanned(false);
  //     }
  //     return;
  //   }
    
  //   if (hasPermission === false) {
  //     Alert.alert('Permission Required', 'Camera access is needed to scan QR codes');
  //     return;
  //   }

  //   setIsScanning(true);
  //   setScanned(false);
  // };

  const onPressScanQRCode = async () => {
    
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Friend</Text>
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
      <Text>hasPermission: {String(hasPermission)}</Text>

      {/* QR Button */}
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={onPressScanQRCode}
      >
        <Ionicons name="qr-code" size={24} color="#000" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Scan QR Code</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 16,
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
