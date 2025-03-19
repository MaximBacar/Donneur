import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../../../context/authContext";
import * as ImagePicker from 'expo-image-picker';

import { BACKEND_URL } from '../../../constants/backend';

export default function PersonProfileScreen() {
  const { user, token, userData, donneurID } = useAuth();
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      let url = `${BACKEND_URL}/receiver/get_balance`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'remove-later'
        }
      });
      const data = await response.json();
      setUserBalance(data);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };
  
  const fetchTransactions = async () => {
      try {

        let url = `${BACKEND_URL}/transaction/get`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning' : 'remove-later'
          }
        });
        let data = await response.json();
        console.log("Transaction data:", data);
        
        // Handle different response formats
        if (!data) {
          console.error("No data received");
          setTransactions([]);
          return;
        }
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.log("Response is not an array, got:", typeof data);
          
          // Check for common nested array patterns
          if (typeof data === 'object') {
            // Try to find an array in common properties
            const possibleArrayProps = ['transactions', 'data', 'results', 'items'];
            
            for (const prop of possibleArrayProps) {
              if (Array.isArray(data[prop])) {
                console.log(`Found transactions in data.${prop}`);
                data = data[prop];
                break;
              }
            }
            
            // If we still don't have an array, check if there's a transaction object that should be wrapped in an array
            if (!Array.isArray(data) && data.id) {
              console.log("Found single transaction object, wrapping in array");
              data = [data];
            } else if (!Array.isArray(data)) {
              console.log("Could not find transaction array in response");
              setTransactions([]);
              return;
            }
          } else {
            console.error("Unexpected response format");
            setTransactions([]);
            return;
          }
        }
    
        const formattedTransactions = data.map(transaction => {
         
          const date = new Date(transaction.creation_date);
          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          
          const isReceived = transaction.receiver_id === donneurID;
  
  
          let description;
  
          switch(transaction.type){
            case 'donation':
              description = 'Anonymous Donation';
              break;
            case 'withdrawal':
              description = `Withdrawal at ${transaction.receiver_id}`;
              break;
            case 'send':
              description = isReceived ? `Payment received from ${transaction.sender_id}` : `Payment sent to ${transaction.sender_id}`
              break;
            default:
              description = `Transaction: ${transaction.type || 'unknown'}`;
              break;
          }
            
          return {
            id: transaction.id,
            description: description,
            date: formattedDate,
            timestamp: formattedTime,
            amount: transaction.amount || 0,
            received: isReceived,
            category: transaction.category || 'other',
            reference: transaction.id,
            raw: transaction
          };
        });
        
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]); // Set to empty array instead of null
      } 
    };

  useEffect(() => {

    const load = async () =>{
      setLoading(true);
      await fetchBalance();
      await fetchTransactions();
      setLoading(false);
      console.log(transactions);
    }
    if (user) {
      load();
    }
  }, [user]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  // Get initials from first and last name
  const getInitials = () => {
    if (userData) {
      return `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`;
    }
    return '';
  };

  // Format full name
  const fullName = userData 
    ? `${userData.first_name} ${userData.last_name}` 
    : '';

  // Get member since date
  const memberSince = userData 
    ? new Date(userData.creation_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    : '';
    
  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    // Handle different date formats
    let birthDate;
    if (dob.includes('-')) {
      // YYYY-MM-DD format
      const [year, month, day] = dob.split('-').map(Number);
      birthDate = new Date(year, month - 1, day);
    } else if (dob.includes('/')) {
      // MM/DD/YYYY format
      const [month, day, year] = dob.split('/').map(Number);
      birthDate = new Date(year, month - 1, day);
    } else {
      return 'N/A';
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleSendMoney = () => {
    router.push('/send-money');
  };

  const handleSendMessage = () => {
    router.push('/send-message');
  };
  
  const handleShareProfile = () => {
    router.push('/(receiver)/(screens)/receive/receive');
  };

  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Banner */}
        <View style={styles.headerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerOverlay} />
          </View>
          <View style={styles.headerBottom}>
            {/* Profile circle with initials */}
            <View style={styles.profileImageContainer}>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{getInitials()}</Text>
              </View>
              {userData && userData.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={22} color="#4F8EF7" style={styles.verifiedIcon} />
                </View>
              )}
            </View>
            
            {/* Full name displayed below */}
            <View style={styles.nameContainer}>
  <Text style={styles.nameText}>{fullName}</Text>

</View>
            
            {userData && userData.location && (
              <Text style={styles.location}>
                <Ionicons name="location-outline" size={16} color="#718096" />
                {' '}{userData.location}
              </Text>
            )}

            <View style={styles.userInfoChips}>
              <View style={styles.userInfoChip}>
                <Ionicons name="calendar-outline" size={14} color="#4F8EF7" />
                <Text style={styles.userInfoChipText}>Joined {memberSince}</Text>
              </View>
              {userData && userData.email && (
                <View style={styles.userInfoChip}>
                  <Ionicons name="mail-outline" size={14} color="#4F8EF7" />
                  <Text style={styles.userInfoChipText}>Verified</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
  style={styles.shareButtonCapsule} 
  onPress={handleShareProfile}
  activeOpacity={0.8}
>
  <Ionicons name="share-social" size={18} color="#4F8EF7" />
  <Text style={styles.shareButtonText}>Share Profile</Text>
</TouchableOpacity>

          </View>
        </View>

        {/* Content Sections */}
        <View style={styles.scrollContent}>
          {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {userData && userData.bio ? (
            <Text style={styles.bio}>{userData.bio}</Text>
          ) : (
            <Text style={styles.emptyBio}>No bio information available</Text>
          )}
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${userBalance ? userBalance.toFixed(2) : 'N/A'}</Text>
            <Text style={styles.statTitle}>Balance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData && userData.dob ? calculateAge(userData.dob) : 'N/A'}</Text>
            <Text style={styles.statTitle}>Age</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{transactions ? transactions.length : '0'}</Text>
            <Text style={styles.statTitle}>Transactions</Text>
          </View>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {transactions && transactions.length > 0 ? (
            transactions.map((item, index) => (
              <View key={index} style={[styles.activityItem, index === transactions.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[
                  styles.activityIconContainer, 
                  { backgroundColor: item.received ? '#ebfaf0' : '#fee2e2' }
                ]}>
                  <Ionicons 
                    name={item.received ? "arrow-down-outline" : "arrow-up-outline"} 
                    size={24} 
                    color={item.received ? "#10b981" : "#ef4444"} 
                  />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>
                    {item.description || (item.received ? 'Received' : 'Sent')}
                  </Text>
                  <Text style={styles.activityDate}>{item.date} • {item.timestamp}</Text>
                </View>
                <View style={styles.activityAmount}>
                  <Text style={[
                    styles.amountText, 
                    { color: item.received ? '#10b981' : '#ef4444' }
                  ]}>
                    {item.received ? '+' : '-'} ${Math.abs(item.amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="receipt-outline" size={40} color="#a0aec0" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>Your transaction history will appear here</Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleSendMoney}
          >
            <Ionicons name="wallet-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleSendMessage}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#4F8EF7" />
            <Text style={styles.secondaryButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
        
          {/* Extra space at bottom for scrolling */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const BANNER_HEIGHT = 150;
const INITIALS_CIRCLE_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  banner: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: '#4F8EF7',
    position: 'relative',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  shareButton: {
    position: 'absolute',
    right: -40,
    top: 4,
    backgroundColor: '#4F8EF7',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerBottom: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  initialsCircle: {
    width: INITIALS_CIRCLE_SIZE,
    height: INITIALS_CIRCLE_SIZE,
    borderRadius: INITIALS_CIRCLE_SIZE / 2,
    backgroundColor: '#4F8EF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -INITIALS_CIRCLE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  userInfoChips: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  userInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2fd',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginTop: 6,
  },
  userInfoChipText: {
    color: '#4F8EF7',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
// Update the nameContainer style (removing the extra padding for the share button)
nameContainer: {
  marginTop: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

// Update nameText style (removing the flex property)
nameText: {
  fontSize: 26,
  fontWeight: '700',
  color: '#1a202c',
  textAlign: 'center',
  letterSpacing: 0.3,
},
shareButtonCapsule: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#EDF2FD',
  borderRadius: 20,
  paddingVertical: 8,
  paddingHorizontal: 16,
  marginTop: 12,
  alignSelf: 'center',
  borderWidth: 1,
  borderColor: '#E1E8FD',
  shadowColor: '#718096',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 1,
},

shareButtonText: {
  color: '#4F8EF7',
  fontSize: 14,
  fontWeight: '600',
  marginLeft: 6,
},
  location: {
    fontSize: 15,
    color: '#718096',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#718096',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2d3748',
    letterSpacing: 0.3,
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4a5568',
    letterSpacing: 0.2,
  },
  emptyBio: {
    fontSize: 15,
    lineHeight: 24,
    color: '#a0aec0',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#718096',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
    height: '80%',
    alignSelf: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F8EF7',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#ebf4ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    color: '#4F8EF7',
    fontSize: 14,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ebf4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activityDate: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  activityAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 6,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#4F8EF7',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#4F8EF7',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryButtonText: {
    color: '#4F8EF7',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});