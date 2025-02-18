import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function ExplorePage() {
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
        {location && (
          <Marker
            coordinate={location}
            title="You are here"
            description="Your current location"
          />
        )}
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