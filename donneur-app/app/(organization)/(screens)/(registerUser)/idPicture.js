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


const screenWidth = Dimensions.get('window').width;


export default function IdPictureScreen() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();


  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);


  const Camera = () => {
    return(
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={overlayStyle.main}>
          <View style={overlayStyle.head}/>
          <View style={overlayStyle.chest}>
            <View style={overlayStyle.circle}/>
          </View>
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

    console.log('handle');
    // POST PIC HERE
    if (!photo) {
      console.error('No photo taken!');
      return;
    }
    try {
      const formData = new FormData();

      console.log('fff');
    
      // Convert base64 image to a Blob (binary format)
      const imgBlob = await fetch(`data:image/jpg;base64,${photo.base64}`).then(res => res.blob());

      console.log('aaa');

      // formData.append('id', 'test_id'); // You can replace 'test_id' with dynamic data if needed
      formData.append('image', imgBlob, 'photo.jpg'); // Make sure to append as 'image'

      console.log('gg');

      const response = await fetch('https://api.donneur.ca/upload_image', {
        method: 'POST',
        body: formData,
      });

      console.log('bbb');

      const result = await response.json();

      if (response.ok) {
        console.log('Image uploaded successfully', result);
        // Handle success (e.g., navigate to the next screen)
        router.push('/idDocument');
      } else {
        console.error('Error uploading image:', result);
      }
    } catch (error) {
      console.log(error);
    }
    router.push('/idDocument');
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
          <Text style={styles.h1}>ID Picture</Text>
          <Text style={styles.h2}>Take user's identification picture</Text>
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
  head:{
    width:150,
    height:200,
    borderRadius:'50%',
    borderWidth:3,
    borderColor: 'white'
  },
  chest:{
    width:'100%',
    height:80,
    backgroundColor:'transparent',
    display:'flex',
    flexDirection:'column',
    overflow:'hidden',
    alignItems:'center',
  },
  circle:{
    width:        '150%',
    height:       '200%',
    borderRadius: '50%',
    borderWidth:  3,
    borderColor: 'white'
  }
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