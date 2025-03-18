import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Button,
  Image
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { useUser } from './registerContext';

import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../config/firebase';
import { useAuth } from '../../../../context/authContext';

const screenWidth = Dimensions.get('window').width;



export default function IdDocumentScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing]             = useState('back');
  const [photo, setPhoto]               = useState(null);
  const cameraRef                       = useRef(null);
  
  const { userID }                      = useUser();
  const { user }                        = useAuth();


  const Camera = () => {
    return(
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={overlayStyle.main}>
          <View style={overlayStyle.card}/>
        </View>
      </CameraView>
    );
  }

  const Confirm = () => {
    return(
      <View style={pictureDisplay.displayView}>
        
        <TouchableOpacity style={pictureDisplay.retakeButton} onPress={handleRetake}>
          <Text style={styles.text}>X</Text>
        </TouchableOpacity>
        <TouchableOpacity style={pictureDisplay.confirmButton} onPress={handleContinue}>
          <Text style={styles.text}>Confirm</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Display = () => {
    return(
      <Image style={pictureDisplay.picture} source={{ uri: photo.uri }} />
    )
  }


  const router = useRouter();

  const handleContinue = async () => {

    if (!photo) {
      console.error('No photo taken!');
      return;
    }
    try {
      // Upload photo to Firebase Storage
      const response = await fetch(photo.uri);
      const blob = await response.blob();

      const imageRef = ref(storage, `/data/${user.uid}/${uuidv4()}.png`);
      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);
      console.log('Image uploaded successfully:', downloadURL);

      router.push('/registerNFC');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    
  };

  const handleRetake = () =>{
    setPhoto(null);
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

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current){
      const options = {
        quality:1,
        base64:false,
        exif:false,
        imageType: 'png'
      };

      const takePhoto = await cameraRef.current.takePictureAsync(options);

      setPhoto(takePhoto);
      
    }
  };

  return (
    <View style={styles.main}>
      
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.h1}>ID Document</Text>
          <Text style={styles.h2}>Scan user’s identification documents</Text>
        </View>
        <View style={styles.placeholder}>
          {
            photo === null ? 
            (<Camera />) : (<Display />)
          }
        </View>
 
          {photo === null ? (
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Take picture</Text>
            </TouchableOpacity>
          ) : (<Confirm/>)}
        
      </View>
    </View>
    
  );
}


const pictureDisplay = StyleSheet.create({
  picture:{
    display:'flex',
    width:'100%',
    height:'100%'
  },
  displayView:{
    width:'100%',
    height:60,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'

  },
  confirmButton:{
    width: '80%',
    height:'100%',
    backgroundColor:'black',
    borderRadius:25,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10
  },
  retakeButton:{
    width: '18%',
    height:'100%',
    position: 'relative',

    backgroundColor:'red',
    borderRadius:25,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10
  }
})


const overlayStyle = StyleSheet.create({
  main:{
    width:'70%',
    height:300,
    backgroundColor:'transparent',
    display: 'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent: 'space-between'
  },
  card:{
    width:'100%',
    height:200,
    borderRadius:20,
    borderWidth:3,
    borderColor: 'white'
  },
});


const styles = StyleSheet.create({
  main:{
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: screenWidth,
    backgroundColor: 'white',
    justifyContent:'center'
  },
  h1:{
    fontSize:32,
    fontWeight:600
  },
  h2:{
    fontSize:16
  },
  title:{
    flex:true,
    width:'100%',
    justifyContent: 'flex-start',
  },
  container: {
    flex: true,
    height: "90%",
    width: '85%',
    alignItems:'center',
    justifyContent:'space-between',
    flexDirection: 'column',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  placeholder: {
    flex: true,
    width: '100%',
    height: '75%',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
    overflow: 'hidden',
    backgroundColor:'red'
  },
  camera: {
    flex: true,
    width: '100%',
    height: '100%',
    alignItems:'center',
    justifyContent:'center'
  },
  button:{
    width: '100%',
    height:60,
    backgroundColor:'black',
    borderRadius:25,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10
  },
  text:{
    color:'white',
    fontSize:20
  }
  
});