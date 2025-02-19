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

const screenWidth = Dimensions.get('window').width;



export default function IdDocumentScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing]             = useState('back');
  const [photo, setPhoto]               = useState(null);
  const cameraRef                       = useRef(null);
  
  const { userID }                      = useUser();


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
      <Image style={pictureDisplay.picture} source={{uri:'data:image/jpg;base64,'+photo.base64}}/>
    )
  }


  const router = useRouter();

  const handleContinue = async () => {

    if (!photo) {
      console.error('No photo taken!');
      return;
    }
    try {

      const cropWidth = photo.width;  
      const cropHeight = photo.width;
      const cropX = (photo.width - cropWidth) / 2; // Center X
      const cropY = (photo.height - cropHeight) / 2; // Center Y

      const resizedPhoto = await ImageManipulator.manipulateAsync(photo.uri, [{ crop: { originX: cropX, originY: cropY, width: cropWidth, height: cropHeight } }], { compress: 0.1, base64:true, format: ImageManipulator.SaveFormat.JPEG});
      
    
      const body = JSON.stringify({
        image_data:   `data:image/jpeg;base64,${resizedPhoto.base64}`,
        type:         'doc',
        receiver_id:  userID
      });

      const response = await fetch('https://api.donneur.ca/upload_base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Important: Expecting JSON
        },
        body:body,
      });

      const textResponse = await response.text();
      console.log(textResponse);

    } catch (error) {
      console.log(error);
    }
    router.push('/registerNFC');
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
        base64:true,
        exif:false
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