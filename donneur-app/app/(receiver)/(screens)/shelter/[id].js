import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ImageBackground, 
  ActivityIndicator, 
  Image,
  RefreshControl,
  StatusBar,
  SafeAreaView
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BACKEND_URL } from '../../../../constants/backend';

export default function ShelterDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Added from your code
  const [shelter, setShelter] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch shelter data
  const fetchShelterData = useCallback(async () => {
    try {
      const url = `${BACKEND_URL}/organization/get?id=${id}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setShelter(data);
      
      let lat = data.address.latitude;
      let long = data.address.longitude;
      setRegion({
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Full error details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchShelterData();
  }, [fetchShelterData]);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShelterData();
  }, [fetchShelterData]);

  const handleGoBack = () => {
    router.back();
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchShelterData}>
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
    if (percentage < 50) return ['#4CAF50', '#2E7D32']; // Green for low occupancy
    if (percentage < 80) return ['#FFC107', '#F57C00']; // Yellow for medium
    return ['#FF5252', '#D32F2F']; // Red for high occupancy
  };
  
  const occupancyColors = getOccupancyColor(occupancyPercentage);
  
  // Format address components
  const formatAddress = () => {
    if (!shelter.address) return 'Address not available';
    
    const { street, city, province, zip } = shelter.address;
    let formattedAddress = '';
    
    if (street) formattedAddress += street;
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
    const { street, city, province, zip } = shelter.address;
    const query = encodeURIComponent(
      `${street}, ${city}, ${province} ${zip}`
    );
    const url = `https://www.google.com/maps/search/${query}`;
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
    });
  };
  
  const handleOpenPhone = () => {
    if (shelter.phone) {
      Linking.openURL(`tel:${shelter.phone}`);
    }
  };

  const handleOpenEmail = () => {
    if (shelter.email) {
      Linking.openURL(`mailto:${shelter.email}`);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shelter.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
            tintColor={'#4A90E2'}
          />
        }
      >
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: shelter.image_url || 'https://via.placeholder.com/400x200' }}
          style={styles.heroImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
            style={styles.heroOverlay}
          >
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Ionicons 
                  name={isFollowing ? "star" : "star-outline"} 
                  size={16} 
                  color={isFollowing ? "#FFC107" : "#FFF"} 
                  style={{marginRight: 8}}
                />
                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.logoContainer}>
            {shelter.image_url ? (
              <Image 
                source={{ uri: shelter.image_url }} 
                style={styles.logo}
              />
            ) : (
              <LinearGradient
                colors={['#4A90E2', '#2E5AAC']}
                style={styles.logo}
              >
                <Text style={styles.logoText}>{getInitials()}</Text>
              </LinearGradient>
            )}
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
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={handleOpenInMaps}
            >
              <LinearGradient
                colors={['#4A90E2', '#2E5AAC']}
                style={styles.contactIconContainer}
              >
                <MaterialCommunityIcons name="map-marker" size={24} color="#FFF" />
              </LinearGradient>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{formatAddress()}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={handleOpenPhone}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.contactIconContainer}
              >
                <MaterialCommunityIcons name="phone" size={24} color="#FFF" />
              </LinearGradient>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{shelter.phone || 'No phone available'}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            
            {shelter.email && (
              <TouchableOpacity 
                style={styles.contactCard}
                onPress={handleOpenEmail}
              >
                <LinearGradient
                  colors={['#FF9800', '#F57C00']}
                  style={styles.contactIconContainer}
                >
                  <MaterialCommunityIcons name="email" size={24} color="#FFF" />
                </LinearGradient>
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
                <LinearGradient
                  colors={occupancyColors}
                  style={styles.occupancyCircle}
                >
                  <Text style={styles.occupancyPercentage}>{occupancyPercentage}%</Text>
                  <Text style={styles.occupancyLabel}>Occupied</Text>
                </LinearGradient>
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
            <TouchableOpacity 
              style={styles.actionButton}  
              onPress={handleGoBack}
            >
              <MaterialCommunityIcons name="directions" size={20} color="white" style={{marginRight: 8}} />
              <Text style={styles.actionButtonText}>Get Directions</Text>
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

          {/* Bottom padding for better scrolling */}
          <View style={{height: 24}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f0f0f',
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
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heroImage: {
    height: 220,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    height: '100%',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  followingButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#4A90E2',
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
    color: '#333',
  },
  shelterSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
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
    color: '#333',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    color: '#333',
  },
  occupancyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  occupancyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginTop: 24,
  },
  occupancyStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  occupancyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  occupancyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  occupancyStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
});