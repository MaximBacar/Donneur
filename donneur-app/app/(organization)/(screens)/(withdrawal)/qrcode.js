import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useUser } from './withdrawalContext'

const QRCode = () => {

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing]             = useState('back');
  const router = useRouter();

  const {setUserID} = useUser()




  if (!permission) {
      // Camera permissions are still loading.
      return <View />;
    }
  
  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  
  return (
    <CameraView style={styles.camera} facing={facing} onBarcodeScanned={({data}) => {
      if (data.includes('give.donneur.ca/')){
        let id = data.split("/")[3];
        console.log(id);
        setUserID(id);
        router.push('/idConfirmation');
      }
      
    }}/>
  )
}

export default QRCode

const styles = StyleSheet.create({
  camera:{
    flex:1
  }
})