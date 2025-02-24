import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ImageBackground, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';

export default function ShelterDetail() {
  const { id } = useLocalSearchParams();
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Added from your code
  const [shelter, setShelter] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch shelter data
  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        const response = await fetch("https://api.donneur.ca/get_shelter_locations");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        // Convert object to array of [id, shelter] pairs
        const sheltersArray = Object.entries(responseData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        const foundShelter = sheltersArray.find(s => s.id === id);
        if (!foundShelter) {
          throw new Error(`Shelter with ID ${id} not found.`);
        }
        setShelter(foundShelter);
        
        // If shelter has coordinates, set the map region
        if (foundShelter.address?.latitude && foundShelter.address?.longitude) {
          setRegion({
            latitude: parseFloat(foundShelter.address.latitude),
            longitude: parseFloat(foundShelter.address.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error('Full error details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShelterData();
  }, [id]);

  // Get user location
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
      
      // Only set region from user location if we don't have shelter coordinates
      if (!region) {
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading shelter information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Error loading shelter</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate the occupancy percentage
  const occupancyPercentage = shelter.current_occupancy && shelter.max_occupancy 
    ? Math.round((shelter.current_occupancy / shelter.max_occupancy) * 100) 
    : 50; // Default if not available
  
  // Determine color based on occupancy
  const getOccupancyColor = (percentage) => {
    if (percentage < 50) return '#4CAF50'; // Green for low occupancy
    if (percentage < 80) return '#FFC107'; // Yellow for medium
    return '#FF5252'; // Red for high occupancy
  };
  
  const occupancyColor = getOccupancyColor(occupancyPercentage);
  
  // Format address components
  const formatAddress = () => {
    if (!shelter.address) return 'Address not available';
    
    const { address, city, province, zip } = shelter.address;
    let formattedAddress = '';
    
    if (address) formattedAddress += address;
    if (city) formattedAddress += (formattedAddress ? ', ' : '') + city;
    if (province) formattedAddress += (formattedAddress ? ', ' : '') + province;
    if (zip) formattedAddress += (formattedAddress ? ' ' : '') + zip;
    
    return formattedAddress || 'Address not available';
  };

  // Get initials for logo
  const getInitials = () => {
    if (!shelter.name) return '??';
    
    const words = shelter.name.split(' ');
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  const handleOpenInMaps = () => {
    const { address, city, province, zip } = shelter.address;
    const query = encodeURIComponent(
      `${address}, ${city}, ${province} ${zip}`
    );
    const url = `https://www.google.com/maps/search/${query}`;
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
    });
  };
    

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <ImageBackground
        source={{ uri: 'https://via.placeholder.com/400x200' }}
        style={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.headerActions}>
           
            <TouchableOpacity 
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{getInitials()}</Text>
          </View>
        </View>
        <Text style={styles.shelterName}>{shelter.name || 'Shelter Name'}</Text>
        <Text style={styles.shelterSubtitle}>{shelter.description || 'No description available'}</Text>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="bed" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {shelter.current_occupancy || '?'}/{shelter.max_occupancy || '?'}
            </Text>
            <Text style={styles.statLabel}>Beds Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {shelter.hours || '24/7'}
            </Text>
            <Text style={styles.statLabel}>Open Hours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {shelter.address?.city || 'City'}
            </Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#4A90E2" />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>{formatAddress()}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="phone" size={24} color="#4A90E2" />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{shelter.phone || 'No phone available'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          {shelter.email && (
            <TouchableOpacity style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={24} color="#4A90E2" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{shelter.email}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Occupancy Section */}
        {shelter.max_occupancy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Occupancy</Text>
            <View style={styles.occupancyContainer}>
              <View style={[styles.occupancyCircle, {backgroundColor: occupancyColor}]}>
                <Text style={styles.occupancyPercentage}>{occupancyPercentage}%</Text>
                <Text style={styles.occupancyLabel}>Occupied</Text>
              </View>
              <View style={styles.occupancyStats}>
                <View style={styles.occupancyStat}>
                  <Text style={styles.occupancyStatValue}>{shelter.current_occupancy || '?'}</Text>
                  <Text style={styles.occupancyStatLabel}>Current</Text>
                </View>
                <View style={styles.occupancyStatDivider} />
                <View style={styles.occupancyStat}>
                  <Text style={styles.occupancyStatValue}>{shelter.max_occupancy}</Text>
                  <Text style={styles.occupancyStatLabel}>Maximum</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            {region && (
              <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {shelter.address?.latitude && shelter.address?.longitude && (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(shelter.address.latitude),
                      longitude: parseFloat(shelter.address.longitude)
                    }}
                    title={shelter.name}
                    description={formatAddress()}
                  />
                )}
              </MapView>
            )}
          </View>
          <TouchableOpacity style={styles.directionButton}  onPress={handleOpenInMaps}>
            <MaterialCommunityIcons name="directions" size={24} color="white" />
            <Text style={styles.directionButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info Section (if available) */}
        {shelter.additional_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{shelter.additional_info}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#FF6B6B',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heroImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
  },
  followingButton: {
    backgroundColor: '#FFF',
  },
  followButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#4A90E2',
  },
  profileContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  logoText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
  },
  shelterName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  shelterSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#DDD',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  occupancyContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  occupancyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  occupancyPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  occupancyLabel: {
    fontSize: 14,
    color: '#FFF',
  },
  occupancyStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  occupancyStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  occupancyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  occupancyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  occupancyStatDivider: {
    width: 1,
    backgroundColor: '#DDD',
    marginHorizontal: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  directionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
});