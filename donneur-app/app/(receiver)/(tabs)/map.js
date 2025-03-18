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
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/FontAwesome';

import { BACKEND_URL } from '../../../constants/backend';

export default function ExplorePage() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(true);
  const [selectedSortOption, setSelectedSortOption] = useState("distance");
  const router = useRouter();
  const isRegionSet = useRef(false);
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
        const url = `${BACKEND_URL}/organization/get`;
        const response = await fetch(url);
        const data = await response.json();

        console.log(data)

        const shelterMarkers = [];

        for (const [id, shelter] of Object.entries(data.shelters)) {
          console.log('ss', shelter);
          const { address } = shelter;
          console.log(address);
          const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.postalcode}`;
          shelterMarkers.push({
            id,
            name: shelter.name,
            city: address.city,
            address: fullAddress,
            description: shelter.description,
            type: shelter.type || "Shelter",
            isOpen: true, // Default value, can be updated with actual data
            distance: 0, // Will be calculated later
            latitude: address.latitude,
            longitude: address.longitude,
          });
        }

        // Calculate distance from user's location if available
        if (location) {
          shelterMarkers.forEach(shelter => {
            shelter.distance = calculateDistance(
              location.latitude,
              location.longitude,
              shelter.latitude,
              shelter.longitude
            );
          });
        }

        setShelters(shelterMarkers);
      } catch (error) {
        console.error("Error fetching shelter locations:", error);
      }
    })();
  }, [location]);

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c ; // Distance in meters
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  const getEstimatedTime = (distance) => {
    // Assuming average walking speed of 5 km/h (or 83.33 m/min)
    const timeInMinutes = Math.round(distance / 83.33);
    return `${timeInMinutes}min`;
  };

  const filteredShelters = shelters.filter((shelter) => {
    const query = searchQuery.toLowerCase();
    return (
      shelter.name.toLowerCase().includes(query) ||
      shelter.city.toLowerCase().includes(query)
    );
  });

  // Sort shelters by selected option
  const sortedShelters = [...filteredShelters].sort((a, b) => {
    if (selectedSortOption === "distance") {
      return a.distance - b.distance;
    } else if (selectedSortOption === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
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
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    }
  }, [searchQuery]);  
  
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
      }, 1000);
    } else {
      Alert.alert("Location Not Available", "We couldn't find your location. Please check your permissions.");
    }
  };

  const toggleList = () => {
    setShowList(!showList);
  };

  const renderShelterItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.shelterItem}
      onPress={() => {
        // Navigate to shelter details or center map on this shelter
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: item.latitude,
            longitude: item.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
        // Optionally navigate to details page
        // router.push(`/shelter/${item.id}`);
      }}
    >
      <View style={styles.shelterInfo}>
        <Text style={styles.shelterName}>{item.name}</Text>
        <Text style={styles.shelterDistance}>{formatDistance(item.distance)} · {item.type}</Text>
        <Text style={styles.shelterAddress}>{item.address}</Text>
        <Text style={styles.shelterStatus}>{item.isOpen ? "Open 24 hours" : "Closed"}</Text>
      </View>
      <View style={styles.shelterTime}>
        <View style={styles.timeCircle}>
          <Text style={styles.timeText}>{getEstimatedTime(item.distance)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        style={[styles.map, showList && styles.mapWithList]}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
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
      
      <TouchableOpacity style={styles.listToggleButton} onPress={toggleList}>
        <Icon name={showList ? "angle-down" : "angle-up"} size={20} color="white" />
      </TouchableOpacity>

      {showList && (
        <View style={styles.shelterListContainer}>
          <View style={styles.shelterListHeader}>
            <View style={styles.shelterCountContainer}>
              <View style={styles.shelterIconCircle}>
                <Icon name="home" size={20} color="white" />
              </View>
              <View>
                <Text style={styles.shelterListTitle}>Shelters</Text>
                <Text style={styles.shelterCount}>{filteredShelters.length} found · <Text style={styles.editSearch}>Edit Search</Text></Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={toggleList}>
              <Icon name="times" size={18} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterOptions}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Open Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Spots Avail.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.filterButtonText}>Sort by Distance</Text>
              <Icon name="chevron-down" size={12} color="#333" style={styles.sortIcon} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedShelters}
            renderItem={renderShelterItem}
            keyExtractor={(item) => item.id}
            style={styles.shelterList}
          />
        </View>
      )}
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
  mapWithList: {
    height: Dimensions.get("window").height * 0.55, // Adjust the height when list is shown
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
    borderRadius: 35,
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
    bottom: 140,
    right: 20,
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    marginVertical: 5, 
    borderRadius: 8
  },
  listToggleButton: {
    position: 'absolute',
    bottom: 195,
    right: 20,
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#007AFF', 
    marginVertical: 5, 
    borderRadius: 8
  },
  shelterListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: Dimensions.get('window').height * 0.45,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shelterListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shelterCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelterIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shelterListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shelterCount: {
    fontSize: 14,
    color: '#666',
  },
  editSearch: {
    color: '#007AFF',
  },
  closeButton: {
    padding: 5,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
  },
  sortIcon: {
    marginLeft: 5,
  },
  shelterList: {
    flex: 1,
  },
  shelterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shelterDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shelterAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shelterStatus: {
    fontSize: 14,
    color: '#666',
  },
  shelterTime: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  timeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});