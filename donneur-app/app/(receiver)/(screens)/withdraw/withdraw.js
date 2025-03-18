import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    router.back();
  };

  const handleOptionPress = (option) => {
    console.log(`Selected option: ${option}`);
    
    switch (option) {
      case 'cash':
        router.push("/(tabs)/map");
        break;
      case 'friend':
        router.push("/(screens)/(friends)/friends");
        break;
      case 'interac':
        // For now, just log this option as it's not implemented yet
        console.log('Interac e-Transfer selected');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>Select a withdrawal method</Text>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Option 1: Interac e-Transfer */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress('interac')}
          >
            <LinearGradient
              colors={['#0070BA', '#1546A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <MaterialCommunityIcons name="bank-transfer" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Interac e-Transfer</Text>
              <Text style={styles.optionDescription}>
                Transfer funds directly to your bank account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          {/* Option 2: Cash */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress('cash')}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <FontAwesome5 name="money-bill-wave" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Cash Pickup</Text>
              <Text style={styles.optionDescription}>
                Withdraw at a partnered location near you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
          
          {/* Option 3: Pay a Friend */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleOptionPress('friend')}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons name="people" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Pay a Friend</Text>
              <Text style={styles.optionDescription}>
                Send money to a friend from your balance
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </View>
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  infoSection: {
    padding: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F5FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});