import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useFriend } from './friendContext';
// import { useUser } from './withdrawalContext'


const ReadFriendCode = () => {

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing]             = useState('back');
  const router = useRouter();

  const {setNewFriendID, setNewFriendUID} = useFriend()


  async function getUID(id){
    try {
      const res = await fetch(`https://api.donneur.ca/get_uid?donneurID=${id}`);
      const data = await res.json();
      setNewFriendUID(data.uid);
    } catch (err) {
      console.error('Error fetching friend data:', err);
    }
  }


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
    <CameraView style={styles.camera} facing={facing} onBarcodeScanned={async({data}) => {
      if (data.includes('give.donneur.ca/')){
        let id = data.split("/")[3];
        setNewFriendID(id);
        await getUID(id);
        router.push('/confirmAddFriend');
        // setUserID(id);
        // router.push('/idConfirmation');
      }
      
    }}/>
  )
}

export default ReadFriendCode

const styles = StyleSheet.create({
  camera:{
    flex:1
  }
})