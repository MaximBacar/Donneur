import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Text,
  Animated,
  TextInput,
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ExplorePage() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const isRegionSet = useRef(false); // Prevents infinite updates
  const mapRef = useRef(null);

  // Glow Animation
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
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to see your position on the map."
        );
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      setLocation({ latitude, longitude });

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          "https://api.donneur.ca/get_shelter_locations"
        );
        const data = await response.json();
        const shelterMarkers = [];

        for (const [id, shelter] of Object.entries(data)) {
          const { address } = shelter;
          const fullAddress = `${address.address}, ${address.city}, ${address.province}, ${address.zip}`;
          const geoResults = await Location.geocodeAsync(fullAddress);
          if (geoResults.length > 0) {
            shelterMarkers.push({
              id,
              name: shelter.name,
              city: address.city,
              description: shelter.description ,
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

  const filteredShelters = shelters.filter((shelter) => {
    const query = searchQuery.toLowerCase();
    return (
      shelter.name.toLowerCase().includes(query) ||
      shelter.city.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (searchQuery.trim() === "") {
      isRegionSet.current = false;
      return;
    }
  
    if (filteredShelters.length > 0) {
      const firstShelter = filteredShelters[0];
  
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: firstShelter.latitude,
            longitude: firstShelter.longitude,
            latitudeDelta: 0.01, // Adjust zoom level
            longitudeDelta: 0.01, // Adjust zoom level
          },
          1000 // Animation duration (1 second)
        );
      }
    }
  }, [searchQuery]);  
  

  // ✅ Zoom Controls
  const zoomIn = () => {
    if (region) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta / 2,
        longitudeDelta: prevRegion.longitudeDelta / 2,
      }));
    }
  };

  const zoomOut = () => {
    if (region) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta * 2,
        longitudeDelta: prevRegion.longitudeDelta * 2,
      }));
    }
  };
  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000); // Animation duration (1 second)
    } else {
      Alert.alert("Location Not Available", "We couldn't find your location. Please check your permissions.");
    }
  };


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search shelters by name or city..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredShelters.map((shelter) => (
          <Marker
            key={shelter.id}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            title={shelter.name}
            description={shelter.description}
            onPress={() => router.push(`/shelter/${shelter.id}`)}
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
                        outputRange: [
                          "rgba(154, 255, 1, 0.5)",
                          "rgba(154, 255, 1, 1)",
                        ],
                      }),
                    },
                  ]}
                >
                  <View style={styles.markerInside} />
                </Animated.View>
              </View>
              <Text
                style={{ fontWeight: "600", transform: [{ translateY: -10 }] }}
              >
                {shelter.name}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
              <Icon name="location-arrow" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  markerBox: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  markerInside: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    backgroundColor: "#d6d6d6",
  },
  markerGlow: {
    borderRadius: 75,
    display: 'flex',
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 120,
    height: 130,
    display:'flex',
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: "center",
  },
  zoomControls: {
    position: "absolute",
    bottom: 40,
    right: 20,
    flexDirection: "column",
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    marginVertical: 5,
    borderRadius: 8,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  searchBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    zIndex: 1,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 140, // Adjusted to not overlap zoom controls
    right: 20,
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    marginVertical: 5, 
    borderRadius: 8
  },
  recenterText: {
    fontSize: 24,
  },
});

