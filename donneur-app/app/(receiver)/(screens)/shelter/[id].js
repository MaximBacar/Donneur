import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

export default function ShelterDetail() {
  const { id } = useLocalSearchParams(); // Get dynamic id from URL
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.logoSection}>
            <View style={styles.logoPlaceholder} />
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.shelterName}>CARE Montreal</Text>
            <Text style={styles.shelterSubtitle}>Montreal’s largest homeless shelter</Text>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>+Follow</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.addressText}>4567 Hochelaga</Text>
          <Text style={styles.addressText}>Montreal, Quebec H1V 1C8</Text>
        </View>

        {/* Telephone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Telephone</Text>
          <Text style={styles.infoText}>+1 (514) 376-4547</Text>
        </View>

        {/* Occupancy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Occupancy</Text>
          <View style={styles.occupancyContainer}>
            <View style={styles.occupancyIndicator}>
              <View style={styles.occupancyCircle}>
                <Text style={styles.occupancyPercent}>50%</Text>
              </View>
            </View>
            <View style={styles.occupancyInfo}>
              <Text style={styles.occupancyNumber}>120</Text>
              <Text style={styles.occupancyLabel}>Current occupancy</Text>
              <Text style={styles.occupancyNumber}>300</Text>
              <Text style={styles.occupancyLabel}>Maximum occupancy</Text>
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
            />
          </View>
        </View>

        {/* Open in Maps Button */}
        <TouchableOpacity style={styles.openMapsButton}>
          <Text style={styles.openMapsButtonText}>Open in maps</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logoSection: {
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'gray',
    borderRadius: 10,
  },
  infoSection: {
    width: '60%',
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  shelterName: {
    fontSize: 32,
    fontWeight: '600',
  },
  shelterSubtitle: {
    fontSize: 16,
    color: '#7B7B7B',
  },
  followButton: {
    marginTop: 10,
    width: 100,
    height: 30,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#7B7B7B',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 20,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 20,
  },
  occupancyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  occupancyIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupancyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#269138',
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupancyPercent: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  occupancyInfo: {
    marginLeft: 20,
  },
  occupancyNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  occupancyLabel: {
    fontSize: 14,
    color: '#333',
  },
  mapContainer: {
    height: 250,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  openMapsButton: {
    height: 60,
    backgroundColor: 'black',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  openMapsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
