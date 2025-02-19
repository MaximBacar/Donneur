import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import IconSymbol from '../../../components/ui/IconSymbol';
// import { LinearGradient } from 'expo-linear-gradient'; // If you want a gradient background

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const router = useRouter();


  const widthdrawl = () => {

  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ============== TOP CARD (Organization Info) ============== */}
        {/* Example: Wrap this in a LinearGradient if you want a gradient background */}
        {/* 
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.topCard}
          >
            ...
          </LinearGradient>
        */}
        <View style={styles.topCard}>
          <Text style={styles.orgName} numberOfLines={1}>
            Shelter Organization
          </Text>
          <Text style={styles.orgAddress} numberOfLines={1}>
            1234 Maple Street, Hometown, Country
          </Text>

          <View style={styles.topCardActions}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                // Share logic here
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color="#ffffff" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============== SHELTER TOOLS SECTION ============== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shelter Tools</Text>

          <View style={styles.toolCardsRow}>
            {/* Announcements */}
            <View style={styles.toolCard}>
              <IconSymbol name="megaphone.fill" size={30} color="#FF9500" />
              <Text style={styles.toolCardTitle} numberOfLines={1}>
                Announcements
              </Text>
              <Text style={styles.toolCardNumber} numberOfLines={1}>
                34
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate or show more info
                }}
              >
                <Text style={styles.toolCardLink} numberOfLines={1}>
                  See more
                </Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <View style={styles.toolCard}>
              <IconSymbol name="message.fill" size={30} color="#007AFF" />
              <Text style={styles.toolCardTitle} numberOfLines={1}>
                Messages
              </Text>
              <Text style={styles.toolCardNumber} numberOfLines={1}>
                354
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate or show more info
                }}
              >
                <Text style={styles.toolCardLink} numberOfLines={1}>
                  See more
                </Text>
              </TouchableOpacity>
            </View>

            {/* Current Occupancy */}
            <View style={styles.toolCard}>
              <IconSymbol name="person.3.fill" size={30} color="#34C759" />
              <Text style={styles.toolCardTitle} numberOfLines={1}>
                Occupancy
              </Text>
              <Text style={styles.toolCardNumber} numberOfLines={1}>
                23
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate or show more info
                }}
              >
                <Text style={styles.toolCardLink} numberOfLines={1}>
                  See more
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ============== USER TOOLS SECTION ============== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Tools</Text>

          {/* First row with two buttons */}
          <View style={styles.userToolsRow}>
            {/* Register User */}
            <TouchableOpacity
              style={styles.userToolButton}
              onPress={() => router.push('/(registerUser)')}
            >
              <IconSymbol name="person.badge.plus" size={24} color="#007AFF" />
              <Text style={styles.userToolButtonText} numberOfLines={1}>
                Register User
              </Text>
            </TouchableOpacity>

            {/* Get User Data */}
            <TouchableOpacity
              style={styles.userToolButton}
              onPress={() => router.push('/get-user-data')}
            >
              <IconSymbol name="person.text.rectangle" size={24} color="#007AFF" />
              <Text style={styles.userToolButtonText} numberOfLines={1}>
                Get User Data
              </Text>
            </TouchableOpacity>
          </View>

          {/* Second row with two buttons (or just one if you like) */}
          <View style={styles.userToolsRow}>
            {/* Withdrawal */}
            <TouchableOpacity
              style={styles.userToolButton}
              onPress={() => router.push('/(screens)/(withdrawal)')}
            >
              <IconSymbol name="arrow.down.circle.fill" size={24} color="#007AFF" />
              <Text style={styles.userToolButtonText} numberOfLines={1}>
                Withdrawal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================== STYLES ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    paddingBottom: 30,
  },

  // ===== Top Card (Organization Info) =====
  topCard: {
    backgroundColor: '#3b5998', // or remove if using LinearGradient
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'flex-start',
  },
  orgName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  orgAddress: {
    fontSize: 14,
    color: '#f0f0f0',
  },
  topCardActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  shareButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#ffffff',
  },

  // ===== Section Title =====
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },

  // ===== Shelter Tools =====
  toolCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolCard: {
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  // Remove right margin from the last card if needed:
  // You can conditionally style the last item or just let them be equally spaced
  toolCardTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  toolCardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  toolCardLink: {
    fontSize: 14,
    color: '#007AFF',
  },

  // ===== User Tools Buttons =====
  userToolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userToolButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 10,
    padding: 16,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    // Elevation for Android
    elevation: 2,
  },
  // If you only want 2 buttons per row, the second button in a row can have marginRight = 0
  // So you might do this manually for each row, or handle it with conditionals
  userToolButtonText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});
