import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert, TouchableOpacity, Text, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";

export default function ExplorePage() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);

  const [shelters, setShelters] = useState([]);

  const router = useRouter();


  const glowSize = useRef(new Animated.Value(50)).current;
  const glowOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animateGlow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowSize, {
            toValue: 50,
            duration: 2000,
            useNativeDriver: false, 
          }),
          Animated.timing(glowSize, {
            toValue: 120,
            duration: 2000,
            useNativeDriver: false, 
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 2002,
            useNativeDriver: false,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0,
            duration: 2002,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateGlow();
  }, []);

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


  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('https://api.donneur.ca/get_shelter_locations');
        const data = await response.json();

  
        const shelterEntries = Object.entries(data);
        const shelterMarkers = [];
  
        for (const [id, shelter] of shelterEntries) {
          const { address } = shelter;
          
          const fullAddress = `${address.address}, ${address.city}, ${address.province}, ${address.zip}`;
          
          const geoResults = await Location.geocodeAsync(fullAddress);
          if (geoResults.length > 0) {
            shelterMarkers.push({
              id,
              name: shelter.name,
              description: shelter.description || "No description available",
              latitude: geoResults[0].latitude,
              longitude: geoResults[0].longitude,
            });
          }
        }
  
        setShelters(shelterMarkers);
      } catch (error) {
        console.error("Error fetching shelter locations:", error);
      }
    })();
  }, []);
  

  // ✅ Function to Zoom In
  const zoomIn = () => {
    if (region) {
      setRegion({
        ...region,
        latitudeDelta: region.latitudeDelta / 2, // Zoom in
        longitudeDelta: region.longitudeDelta / 2,
      });
    }
  };

  // ✅ Function to Zoom Out
  const zoomOut = () => {
    if (region) {
      setRegion({
        ...region,
        latitudeDelta: region.latitudeDelta * 2, // Zoom out
        longitudeDelta: region.longitudeDelta * 2,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion} // Keeps track of region changes
        showsUserLocation={true} // Blue dot for user location
        showsMyLocationButton={true} // Adds a location button
      >
        { shelters.map(shelter => (
          
            <Marker
              key={shelter.id}
              coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
              title={shelter.name}
              description={shelter.description}
              style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
              }}
              onPress={() => router.push(`../(screens)/shelter/123`)}
            >
              <View style={styles.marker}>
                <View style={styles.markerBox}>
                  <Animated.View
                    style={[
                      styles.markerGlow,
                      {
                        width: glowSize,
                        height: glowSize,
                        backgroundColor: glowOpacity.interpolate({
                          inputRange: [0.5, 1],
                          outputRange: ["rgba(154, 255, 1, 0.5)", "rgba(154, 255, 1, 1)"],
                        }),
                      },
                    ]}
                  >
                    <View style={styles.markerInside}/>
                  </Animated.View>
                  
                </View>
                <Text style={{'fontWeight':'600', 'transform':[{ translateY: -10 }]}}>{shelter.name}</Text>
              </View>
            </Marker>
        ))}
        
      </MapView>

      {/* ✅ Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  markerBox:{
    width:120,
    height:120,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'column',

  },
  markerInside:{
    width:70,
    height:70,
    borderRadius:'50%',
    backgroundColor:'#d6d6d6',
  },
  markerGlow:{
    
    borderRadius: 75, // Ensure it's always circular
    display: 'flex',
    alignItems: "center",
    justifyContent: "center",
    
  },
  marker:{
    width:120,
    height:130,
    display:'flex',
    flexDirection: 'column',
    alignItems:'center',
    justifyContent:'center'
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40, // Adjust based on UI
    right: 20,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 5,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    marginVertical: 5,
    borderRadius: 8,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});