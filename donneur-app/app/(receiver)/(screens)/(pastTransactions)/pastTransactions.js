import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ReAnimated from 'react-native-reanimated';
const { FadeIn, FadeInDown, FadeInRight } = ReAnimated;

// Import UI components and constants
import IconSymbol from "../../../../components/ui/IconSymbol";
import { Colors } from "../../../../constants/colors";
import { useAuth } from "../../../../context/authContext";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Empty transactions array to be filled by API
const transactionsData = [];

export default function PastTransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, donneurID } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState(transactionsData);
  const [filterType, setFilterType] = useState('all');
  
  // Modal animation values
  const modalBackgroundOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(screenHeight)).current;

  // Function to fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Get receiver ID if not already available in context
      let receiverId = donneurID;
      if (!receiverId && user) {
        const userResponse = await fetch(`https://api.donneur.ca/get_user?uid=${user.uid}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        receiverId = userData.db_id;
      }
      
      if (!receiverId) {
        console.error('No receiver ID available');
        setIsLoading(false);
        return;
      }
      
      // Step 2: Fetch transactions using the receiver ID
      const transactionsResponse = await fetch(`https://api.donneur.ca/get_transactions?receiver_id=${receiverId}`);
      if (!transactionsResponse.ok) throw new Error('Failed to fetch transactions');
      const data = await transactionsResponse.json();
      
      // Format the transactions for display
      const formattedTransactions = data.transactions.map(transaction => {
        // Convert date string to more readable format
        const date = new Date(transaction.creation_date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        
        // Determine transaction type and description
        const isReceived = transaction.transaction_type === 'received';
        const description = isReceived 
          ? `Payment received from ${transaction.sender_id}`
          : `Payment sent to ${transaction.receiver_id}`;
          
        return {
          id: transaction.id,
          description: description,
          date: formattedDate,
          timestamp: formattedTime,
          amount: isReceived ? transaction.amount : -transaction.amount,
          type: isReceived ? 'deposit' : 'withdrawal',
          status: transaction.confirmed ? 'completed' : 'pending',
          category: transaction.type || 'transfer',
          reference: transaction.id,
          raw: transaction // Store the raw data for reference
        };
      });
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTransactions();
  }, [donneurID, user]);

  // Calculate the total values
  const totalTransactions = transactions.length;
  const netAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const lastUpdated = transactions.length > 0 ? transactions[0].date : 'Never';

  // Filter transactions by type
  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => filterType === 'deposits' 
        ? t.amount > 0 
        : t.amount < 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [donneurID, user]);

  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
    
    // Animate the modal opening
    Animated.parallel([
      // Fade in the background
      Animated.timing(modalBackgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Slide up the content
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    // Animate the modal closing
    Animated.parallel([
      // Fade out the background
      Animated.timing(modalBackgroundOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      // Slide down the content
      Animated.timing(modalTranslateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes, update state
      setSelectedTransaction(null);
      setModalVisible(false);
    });
  };

  // Icon for transaction type
  const getTransactionTypeIcon = (type, category) => {
    switch (type) {
      case 'deposit':
        return category === 'bonus' 
          ? 'gift-outline'
          : 'arrow-down-outline';
      case 'withdrawal':
        return category === 'bank' 
          ? 'card-outline' 
          : 'arrow-up-outline';
      case 'fee':
        return 'receipt-outline';
      default:
        return 'swap-horizontal-outline';
    }
  };
  
  // Get status color based on transaction status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#34C759'; // Green
      case 'pending':
        return '#FF9500'; // Orange
      case 'cancelled':
        return '#FF3B30'; // Red
      default:
        return Colors.light.icon;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={FadeInDown.duration(500).springify()}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerRight} />
      </Animated.View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.light.tint]} 
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <Animated.View 
              style={styles.summaryCard}
              entering={FadeInDown.delay(100).duration(500).springify()}
            >
              <Text style={styles.cardTitle}>Account Summary</Text>
              
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Transactions</Text>
                  <Text style={styles.summaryValue}>{totalTransactions}</Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Net Amount</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: netAmount >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {netAmount >= 0 ? '+' : '-'}${Math.abs(netAmount).toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Last Updated</Text>
                  <Text style={styles.summaryDateTime}>{lastUpdated}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Filter Section */}
            <Animated.View 
              style={styles.filterContainer}
              entering={FadeInDown.delay(200).duration(500).springify()}
            >
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  filterType === 'all' && styles.filterButtonActive
                ]}
                onPress={() => setFilterType('all')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === 'all' && styles.filterButtonTextActive
                ]}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  filterType === 'deposits' && styles.filterButtonActive
                ]}
                onPress={() => setFilterType('deposits')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === 'deposits' && styles.filterButtonTextActive
                ]}>Deposits</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  filterType === 'withdrawals' && styles.filterButtonActive
                ]}
                onPress={() => setFilterType('withdrawals')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === 'withdrawals' && styles.filterButtonTextActive
                ]}>Withdrawals</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Transactions List */}
            <Animated.View 
              style={styles.transactionsSection}
              entering={FadeInDown.delay(300).duration(500).springify()}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {filteredTransactions.length} Transactions
                </Text>
              </View>

              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-outline" size={48} color={Colors.light.icon} />
                  <Text style={styles.emptyStateText}>No transactions found</Text>
                </View>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <Animated.View 
                    key={transaction.id}
                    entering={FadeInRight.delay(index * 50).duration(500)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.transactionItem,
                        {
                          borderLeftWidth: 4,
                          borderLeftColor: transaction.amount >= 0 ? '#34C759' : '#FF3B30'
                        }
                      ]}
                      onPress={() => openModal(transaction)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.transactionIconContainer,
                        { backgroundColor: Colors.light.tint + '15' } // 15% opacity of tint color
                      ]}>
                        <Ionicons 
                          name={getTransactionTypeIcon(transaction.type, transaction.category)} 
                          size={24} 
                          color={Colors.light.tint} 
                        />
                      </View>
                      
                      <View style={styles.transactionInfo}>
                        <View style={styles.transactionTitleRow}>
                          <Text style={styles.transactionDesc} numberOfLines={1}>
                            {transaction.description}
                          </Text>
                          {transaction.status !== 'completed' && (
                            <View style={[
                              styles.statusBadge,
                              { backgroundColor: getStatusColor(transaction.status) + '20' } // 20% opacity
                            ]}>
                              <Text style={[
                                styles.statusText,
                                { color: getStatusColor(transaction.status) }
                              ]}>
                                {transaction.status}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.transactionDate}>
                          {transaction.date} • {transaction.timestamp}
                        </Text>
                      </View>
                      
                      <Text style={[
                        styles.transactionAmount,
                        transaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount
                      ]}>
                        {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Transaction Details Modal */}
      {modalVisible && (
        <View style={styles.modalWrapper}>
          <Animated.View 
            style={[
              styles.modalContainer, 
              { opacity: modalBackgroundOpacity }
            ]}
          >
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeModal}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: modalTranslateY }] }
            ]}
          >
            {selectedTransaction && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Transaction Details</Text>
                  <TouchableOpacity 
                    onPress={closeModal}
                    style={styles.modalCloseIcon}
                    hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                  >
                    <Ionicons name="close" size={24} color={Colors.light.icon} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalDivider} />
                
                <View style={styles.modalBody}>
                  {/* Transaction Icon */}
                  <View style={[
                    styles.modalTransactionIcon,
                    { backgroundColor: Colors.light.tint }
                  ]}>
                    <Ionicons 
                      name={getTransactionTypeIcon(
                        selectedTransaction.type, 
                        selectedTransaction.category
                      )} 
                      size={32} 
                      color="#FFF" 
                    />
                  </View>
                  
                  {/* Transaction Amount */}
                  <Text style={[
                    styles.modalAmount,
                    selectedTransaction.amount >= 0 ? styles.positiveAmount : styles.negativeAmount
                  ]}>
                    {selectedTransaction.amount >= 0 ? '+' : '-'}
                    ${Math.abs(selectedTransaction.amount).toFixed(2)}
                  </Text>
                  
                  {selectedTransaction.status !== 'completed' && (
                    <View style={[
                      styles.modalStatusBadge,
                      { backgroundColor: getStatusColor(selectedTransaction.status) }
                    ]}>
                      <Text style={styles.modalStatusText}>
                        {selectedTransaction.status.charAt(0).toUpperCase() + 
                         selectedTransaction.status.slice(1)}
                      </Text>
                    </View>
                  )}
                  
                  {/* Details Rows */}
                  <View style={styles.modalDetailsContainer}>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Description</Text>
                      <Text style={styles.modalDetailValue}>{selectedTransaction.description}</Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Date & Time</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedTransaction.date} at {selectedTransaction.timestamp}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Type</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedTransaction.type.charAt(0).toUpperCase() + 
                         selectedTransaction.type.slice(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Category</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedTransaction.category.charAt(0).toUpperCase() + 
                         selectedTransaction.category.slice(1)}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Reference</Text>
                      <Text style={styles.modalDetailValue}>{selectedTransaction.reference}</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  
  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.icon,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.light.text,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  summaryItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  summaryDateTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  
  // Filter Section
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.icon,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Transaction List Section
  transactionsSection: {
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  
  // Transaction Items
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.light.icon,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    marginLeft: 8,
  },
  positiveAmount: {
    color: '#34C759', // Apple system green
  },
  negativeAmount: {
    color: '#FF3B30', // Apple system red
  },
  
  // Modal Styles
  modalWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: screenHeight * 0.9,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    marginBottom: 24,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalTransactionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalDetailsContainer: {
    width: '100%',
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalDetailRow: {
    marginBottom: 12,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  modalCloseButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
