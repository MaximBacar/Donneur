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
  PanResponder,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
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
  const [modalPosition, setModalPosition] = useState("half"); // "half", "minimized"
  
  // Initialize modal at half-screen position
  useEffect(() => {
    if (showList) {
      snapToPosition("half");
    }
  }, []);
  const router = useRouter();
  const isRegionSet = useRef(false);
  const mapRef = useRef(null);
  
  // Screen dimensions for modal calculations
  const screenHeight = Dimensions.get("window").height;
  const minimizedPosition = screenHeight - 60; // Just the drag handle visible 
  const halfScreenPosition = screenHeight * 0.35; // Half screen
  
  // Modal Animation
  const modalY = useRef(new Animated.Value(halfScreenPosition)).current;
  
  // Glow Animation
  const glowSize = useRef(new Animated.Value(50)).current;
  const glowOpacity = useRef(new Animated.Value(0.8)).current;
  
  // Pan Responder for dragging the modal
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store the current position when touch starts
        modalY.setOffset(modalY._value - (modalPosition === "half" ? halfScreenPosition : minimizedPosition));
        modalY.setValue(modalPosition === "half" ? halfScreenPosition : minimizedPosition);
      },
      onPanResponderMove: (event, gesture) => {
        // Allow dragging only within limits
        const newPosition = Math.max(
          halfScreenPosition, 
          Math.min(minimizedPosition, gesture.dy + (modalPosition === "half" ? halfScreenPosition : minimizedPosition))
        );
        modalY.setValue(newPosition - modalY._offset);
      },
      onPanResponderRelease: (event, gesture) => {
        // Clear the offset
        modalY.flattenOffset();
        
        // Threshold for determining snap position
        const threshold = (halfScreenPosition + minimizedPosition) / 2;
        
        // Determine where to snap based on the velocity and position
        if (gesture.vy > 0.5 || modalY._value > threshold) {
          // Snap to minimized position
          snapToPosition("minimized");
        } else {
          // Snap to half screen
          snapToPosition("half");
        }
      },
    })
  ).current;
  
  // Function to animate the modal to a specific position
  const snapToPosition = (position, cb) => {
    const toValue = position === "half" ? halfScreenPosition : minimizedPosition;
    
    // Make sure we reset any offsets before animating
    modalY.flattenOffset();
    
    const animation = Animated.spring(modalY, {
      toValue,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    });
    
    // Set the modal position state
    setModalPosition(position);
    
    // Start the animation and handle completion
    if (cb && typeof cb === 'function') {
      animation.start(cb);
    } else {
      animation.start();
    }
  };


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
            image_url: shelter.image_url || "https://via.placeholder.com/400x200", // Use image_url from DB or fallback
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
    if (!showList) {
      setShowList(true);
      // Use a small delay to ensure state update before animation
      setTimeout(() => snapToPosition("half"), 10);
    } else {
      // If list is already showing, toggle between half and minimized
      if (modalPosition === "half") {
        snapToPosition("minimized");
      } else {
        snapToPosition("half");
      }
    }
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
        router.push(`/shelter/${item.id}`);
      }}
    >
      <Image 
        source={{ uri: item.image_url }}
        style={styles.shelterImage}
        resizeMode="cover"
      />
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
      <MapView
        ref={mapRef}
        style={styles.map}
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
                  <Image 
                    source={{ uri: shelter.image_url }}
                    style={styles.markerImage}
                    resizeMode="cover"
                  />
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

      <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
        <View style={styles.locationButtonInner}>
          <Icon name="crosshairs" size={20} color="#007AFF" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.shelterButton} 
        onPress={() => {
          setShowList(true);
          setTimeout(() => snapToPosition("half"), 10);
        }}
      >
        <LinearGradient
          colors={['#0055b3', '#003380']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
        <Text style={styles.shelterButtonText}>See Shelters</Text>
        <Icon name="angle-up" size={16} color="white" style={{marginLeft: 8}} />
      </TouchableOpacity>

      {showList && (
        <Animated.View 
          style={[
            styles.shelterListContainer, 
            {
              transform: [{ translateY: modalY }]
            }
          ]}
        >
          {/* Drag handle */}
          <View 
            style={styles.dragHandle} 
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandleBar} />
            
            {/* Show just the title in the handle when minimized */}
            {modalPosition === "minimized" && (
              <View style={styles.minimizedTitleContainer}>
                <Text style={styles.minimizedTitle}>
                  {filteredShelters.length} Shelters Nearby
                </Text>
              </View>
            )}
          </View>
          
          {/* Only show the full header when not minimized */}
          {modalPosition === "half" && (
            <>
            <View style={styles.searchBar}>
                <Icon name="search" size={18} color="#999" style={{marginRight: 8}} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search shelters by name or city..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Icon name="times-circle" size={16} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.shelterListHeader}>
                <View style={styles.shelterCountContainer}>
                  <View style={styles.shelterIconCircle}>
                    <Icon name="home" size={16} color="white" />
                  </View>
                  <View>
                    <Text style={styles.shelterListTitle}>Shelters</Text>
                    <Text style={styles.shelterCount}>{filteredShelters.length} found</Text>
                  </View>
                </View>
                {/* <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => {
                    // Use a different approach - animate first, then use setTimeout
                    snapToPosition("minimized");
                    setTimeout(() => setShowList(false), 300);
                  }}
                >
                  <View style={styles.closeButtonInner}>
                    <Icon name="times" size={16} color="white" />
                  </View>
                </TouchableOpacity> */}
              </View>
              
            </>
          )}

          {/* Only show filter options and list when not minimized */}
          {modalPosition === "half" && (
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={styles.filterOptions}>
                <TouchableOpacity style={styles.filterButton}>
                  <Icon name="clock-o" size={14} color="#007AFF" style={{marginRight: 5}} />
                  <Text style={styles.filterButtonText}>Open Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Icon name="check-circle" size={14} color="#007AFF" style={{marginRight: 5}} />
                  <Text style={styles.filterButtonText}>Spots Avail.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton}>
                  <Icon name="sort" size={14} color="#007AFF" style={{marginRight: 5}} />
                  <Text style={styles.filterButtonText}>Distance</Text>
                  <Icon name="chevron-down" size={10} color="#007AFF" style={styles.sortIcon} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={sortedShelters}
                renderItem={renderShelterItem}
                keyExtractor={(item) => item.id}
                style={styles.shelterList}
                contentContainerStyle={{ 
                  paddingBottom: 380,
                  flexGrow: 1,
                }}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                initialNumToRender={24}
                maxToRenderPerBatch={24}
                removeClippedSubviews={false}
              />
            </View>
          )}
        </Animated.View>
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
  markerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "white",
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
  locationButtonInner: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  shelterButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    overflow: 'hidden',
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  shelterButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  searchBar: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recenterButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  shelterListContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: Dimensions.get('window').height,
    maxHeight: Dimensions.get('window').height,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  dragHandle: {
    width: '100%',
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  dragHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  minimizedTitleContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  minimizedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  shelterListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shelterCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelterIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shelterListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  shelterCount: {
    fontSize: 13,
    color: '#666',
  },
  editSearch: {
    color: '#007AFF',
  },
  closeButton: {
    marginLeft: 10,
  },
  closeButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6347',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f2ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f2ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  sortIcon: {
    marginLeft: 4,
  },
  shelterList: {
    flex: 1,
    height: '100%',
    marginTop: 0,
    marginBottom: 0,
  },
  shelterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shelterImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
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