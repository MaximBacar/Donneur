import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function ShelterDetail() {
    const { id } = useLocalSearchParams(); // Get the dynamic `id` from the URL
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState(null);

    useEffect(() => {
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow location access to see your position on the map.');
            return;
          }
    
          let userLocation = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = userLocation.coords;
          
          setLocation({ latitude, longitude });
    
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01, // Initial Zoom Level
            longitudeDelta: 0.01,
          });
        })();
      }, []);

  return (
    <View style={styles.main}>
      <View style={styles.content}>
            <View style={styles.profile}>
                <View style={styles.logoPlaceholder}>
                    <View style={{width:120, height:120, backgroundColor:'gray'}}></View>
                </View>
                <View style={styles.title}>
                    <View style={{width:'100%', height:'60%'}}>
                        <Text style={{fontSize:32, fontWeight:'600'}}>CARE Montreal</Text>
                        <Text style={{fontSize:16, color:'#7B7B7B'}}>Montreal’s largest homeless shelter</Text>
                    </View>
                    <TouchableOpacity style={styles.followBtn}>
                        <Text>+Follow</Text>
                    </TouchableOpacity>
                    
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>
                <Text style={{fontSize:20, fontWeight:'600'}}>4567 Hochelaga</Text>
                <Text style={{fontSize:20}}>Montreal, Quebec H1V 1C8</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Telephone</Text>
                <Text style={{fontSize:20}}>+1 (514) 376-4547</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Occupancy</Text>
                <View style={styles.occupancyBox}>
                    <View style={styles.occupancy}>
                        <View style={{width:'80%', height:'80%', display:'flex', alignContent:'center', justifyContent:'center', borderRadius:'50%', backgroundColor:'white'}}>
                        <Text style={{textAlign:'center'}}>50%</Text>
                        </View>
                        
                    </View>
                    <View style={styles.occupancyStats}>
                        <Text style={{fontSize:32, fontWeight:'800'}}>120</Text>
                        <Text>Current occupancy</Text>
                        <Text style={{fontSize:32, fontWeight:'800'}}>300</Text>
                        <Text>Maximum occupancy</Text>
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Map</Text>
                <View style={styles.map}>
                    <MapView 
                        style={{width:'100%', height:'100%'}}
                        region={region}
                        onRegionChangeComplete={setRegion} // Keeps track of region changes
                        showsUserLocation={true} // Blue dot for user location
                        showsMyLocationButton={true} // Adds a location button
                    />
                </View>
            </View>

            <TouchableOpacity style={{width:'100%', height:60, backgroundColor:'black', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:20}}>
                <Text style={{color:'white'}}>Open in maps</Text>
            </TouchableOpacity>
            
      </View>
    </View>
  );

  
}
const styles = StyleSheet.create({
    main:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'white',
        flexDirection: 'column'
    },
    content:{
        display:'flex',
        alignItems:'center',
        width:'90%',
        height:'90%',
        justifyContent:'space-between'
    },
    profile:{
        width: '100%',
        height: 120,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between'
    },
    logoPlaceholder:{
        height:'100%',
        width:'34%',
        display:'flex',
        alignItems:'flex-start',
        justifyContent:'center',
    },
    title:{
        height:'100%',
        width:'65%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between'
    },
    followBtn:{
        display:'flex',
        width:100,
        height:30,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        borderWidth:1
    },
    section:{
        width:'100%',
        display:'flex',
        flexDirection:'column',
        marginTop:2,
        marginBottom:2
    },
    sectionTitle:{
        color:'#7B7B7B',
        fontSize:16,
        width:'100%',
        textAlign:'left',
        marginBottom:5
    },
    occupancyBox:{
        width:'100%',
        height:120,
        borderRadius:20,
        borderWidth:1,
        borderColor:'#E4E4E4',
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingLeft:40,
        paddingRight:40
    },
    occupancy:{
        width:80,
        height:80,
        borderRadius:'50%',
        backgroundColor:'#269138',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
        
    },
    occupancyStats:{
        height:80,
        width:150,
        display:'flex',
        flexDirection:'column',

        justifyContent:'center'
    },
    map:{
        width:'100%',
        height:250,
        borderRadius:20,
        borderWidth:1,
        borderColor:'#E4E4E4',
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        overflow:'hidden'
    },
});