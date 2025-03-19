import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
  Animated,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import IconSymbol from '../../../components/ui/IconSymbol';
import { useAuth } from '../../../context/authContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

import { BACKEND_URL } from '../../../constants/backend';
// Financial metrics (will be calculated from real data)
const financialMetrics = {
  totalWithdrawals: 0,
  pendingWithdrawals: 0,
  availableBalance: 0,
  totalUsers: 0,
  monthlyChange: 0,
  lastUpdate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
};

export default function FinanceScreen() {
  const { user, donneurID, token } = useAuth();
  
  // State management
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({...financialMetrics});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.97)).current;
  const balanceScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Modal animation values
  const modalBackgroundOpacity = useRef(new Animated.Value(0)).current;
  // Start with the modal positioned just below the screen
  const modalTranslateY = useRef(new Animated.Value(screenHeight)).current;

  // Modal management
  const openModal = (item) => {
    setSelectedItem(item);
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
      setSelectedItem(null);
      setModalVisible(false);
    });
  };

  // Filter transactions by date
  const isToday = (dateString) => {
    const today = new Date();
    const itemDate = new Date(dateString);
    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  };

  // Filter handlers
  const filterByTimeframe = (timeframe) => {
    let filtered = [];
    
    if (timeframe === 'all') {
      filtered = transactions;
    } else if (timeframe === 'today') {
      filtered = transactions.filter(item => {
        return isToday(item.timestamp);
      });
    } else if (timeframe === 'past') {
      filtered = transactions.filter(item => {
        return !isToday(item.timestamp);
      });
    }
    
    // Apply search filter if exists
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.notes.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    setFilteredData(filtered);
    setActiveTab(timeframe);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const lowercasedQuery = text.toLowerCase();
      const filtered = transactions.filter(item => {
        // Check if passes timeframe filter
        if (activeTab === 'today' && !isToday(item.timestamp)) return false;
        if (activeTab === 'past' && isToday(item.timestamp)) return false;
        
        // Then check search text
        return (
          item.name.toLowerCase().includes(lowercasedQuery) ||
          item.notes.toLowerCase().includes(lowercasedQuery)
        );
      });
      setFilteredData(filtered);
    } else {
      filterByTimeframe(activeTab);
    }
  };

  // Fetch transactions data from API
  const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, get user data to get the DB ID
        let userDbId = donneurID;
        
        if (!userDbId) {
          setError("No organization ID found. Please log in again.");
          setLoading(false);
          return;
        }

        let url = `${BACKEND_URL}/transaction/get`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning' : 'remove-later'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
      
        const transactionsData = await response.json();
        console.log(transactionsData);
        
        if (transactionsData && transactionsData.transactions) {
          // Transform the API data to match our component's expected format
          const formattedTransactions = transactionsData.transactions.map(tx => {
            const date = new Date(tx.creation_date);
            // Format the date similar to our previous mock data
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            
            return {
              id: tx.id,
              name: tx.sender_id, // We don't have name, so use sender_id 
              date: formattedDate,
              amount: parseFloat(tx.amount),
              status: tx.confirmed ? 'completed' : 'pending',
              type: tx.transaction_type,
              userId: tx.sender_id,
              timestamp: tx.creation_date,
              notes: `${tx.transaction_type} - ${tx.currency}`,
              currency: tx.currency
            };
          });
          
          setTransactions(formattedTransactions);
          setFilteredData(formattedTransactions);
          
          // Update financial metrics
          const totalWithdrawals = formattedTransactions
            .filter(tx => tx.status === 'completed')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
          const pendingWithdrawals = formattedTransactions
            .filter(tx => tx.status === 'pending')
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          setMetrics({
            totalWithdrawals,
            pendingWithdrawals,
            availableBalance: totalWithdrawals + pendingWithdrawals,
            totalUsers: new Set(formattedTransactions.map(tx => tx.userId)).size,
            monthlyChange: 0, // We don't have historical data to calculate this
            lastUpdate: new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })
          });
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (donneurID) {
      await fetchTransactions();
    }
    setRefreshing(false);
  }, [donneurID]);

  useEffect(() => {
    if (donneurID) {
      fetchTransactions();
    }
  }, [donneurID]);

  // Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Create a pulsing animation for the balance
    const pulseAnimation = Animated.sequence([
      Animated.timing(balanceScaleAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(balanceScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]);

    // Start the pulsing animation after a delay
    setTimeout(() => {
      pulseAnimation.start();
    }, 800);
  }, []);

  // Format currency amount
  const formatCurrency = (amount, currency = 'USD') => {
    // Add support for different currencies
    const currencySymbols = {
      'USD': '$',
      'CAD': 'C$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  // Render transaction item
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => openModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionIconContainer}>
        <LinearGradient
          colors={item.status === 'pending' ? ['#FFB258', '#FF9500'] : ['#3396FF', '#0A7EA4']}
          style={styles.transactionIcon}
        >
          <IconSymbol 
            name={item.status === 'pending' ? 'clock.fill' : 'arrow.down.circle.fill'} 
            color="#FFFFFF" 
            size={18} 
          />
        </LinearGradient>
      </View>
      
      <View style={styles.transactionInfo}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionName} numberOfLines={1}>{item.name}</Text>
          <Text style={[
            styles.transactionAmount,
            {color: item.status === 'pending' ? '#FF9500' : '#0A7EA4'}
          ]}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
        </View>
        
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate}>{item.date}</Text>
          <View style={[
            styles.statusBadge, 
            {backgroundColor: item.status === 'pending' ? '#FFF5EB' : '#E6F6FD'}
          ]}>
            <Text style={[
              styles.statusText,
              {color: item.status === 'pending' ? '#FF9500' : '#0A7EA4'}
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.transactionNotes} numberOfLines={1}>{item.notes}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
          />
        }
      >
        {/* ========== HEADER SECTION ========== */}
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <View>
            <Text style={styles.headerTitle}>Financial Overview</Text>
            <Text style={styles.headerSubtitle}>Updated {metrics.lastUpdate}</Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton}>
            <IconSymbol name="square.and.arrow.up" size={20} color={Colors.light.tint} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* ========== BALANCE CARD ========== */}
        <Animated.View 
          style={[
            styles.balanceCardContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: translateY },
                { scale: cardScaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#0A7EA4', '#005b84']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceCardContent}>
              <View style={styles.balanceTopRow}>
                <View>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Animated.Text 
                    style={[
                      styles.balanceAmount,
                      { transform: [{ scale: balanceScaleAnim }] }
                    ]}
                  >
                    {formatCurrency(metrics.availableBalance)}
                  </Animated.Text>
                </View>
                
                <View style={styles.monthlyChangeBadge}>
                  <IconSymbol name="arrow.up" size={12} color="#22C55E" />
                  <Text style={styles.monthlyChangeText}>{metrics.monthlyChange}%</Text>
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatCurrency(metrics.totalWithdrawals)}</Text>
                  <Text style={styles.statLabel}>Withdrawn</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{metrics.totalUsers}</Text>
                  <Text style={styles.statLabel}>Users</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* ========== SEARCH SECTION ========== */}
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <View style={styles.searchInputContainer}>
            <IconSymbol name="magnifyingglass" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </Animated.View>
        
        {/* ========== TABS SECTION ========== */}
        <Animated.View 
          style={[
            styles.tabsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => filterByTimeframe('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'today' && styles.activeTab]}
              onPress={() => filterByTimeframe('today')}
            >
              <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'past' && styles.activeTab]}
              onPress={() => filterByTimeframe('past')}
            >
              <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.transactionsTitle}>
            Transactions ({filteredData.length})
          </Text>
          
          {/* ========== TRANSACTIONS LIST ========== */}
          <View style={styles.transactionsList}>
            {loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text style={styles.emptyText}>Loading transactions...</Text>
              </View>
            ) : error ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="exclamationmark.triangle" size={36} color="#F59E0B" />
                <Text style={styles.emptyText}>{error}</Text>
              </View>
            ) : filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconSymbol name="doc.text.magnifyingglass" size={36} color="#CBD5E1" />
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            ) : (
              filteredData.map(item => (
                <React.Fragment key={item.id}>
                  {renderTransactionItem({ item })}
                </React.Fragment>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ========== TRANSACTION DETAILS MODAL ========== */}
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
            <View style={styles.modalHeader}>
              <View style={styles.modalHandleBar} />
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
                <IconSymbol name="xmark" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <View style={styles.modalBody}>
                <View style={styles.modalIconContainer}>
                  <LinearGradient
                    colors={selectedItem.status === 'pending' ? ['#FFB258', '#FF9500'] : ['#3396FF', '#0A7EA4']}
                    style={styles.modalIcon}
                  >
                    <IconSymbol 
                      name={selectedItem.status === 'pending' ? 'clock.fill' : 'arrow.down.circle.fill'} 
                      color="#FFFFFF" 
                      size={30} 
                    />
                  </LinearGradient>
                </View>
                
                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalAmount}>{formatCurrency(selectedItem.amount, selectedItem.currency)}</Text>
                
                <View style={styles.modalStatusContainer}>
                  <View style={[
                    styles.modalStatusBadge, 
                    {backgroundColor: selectedItem.status === 'pending' ? '#FFF5EB' : '#E6F6FD'}
                  ]}>
                    <IconSymbol 
                      name={selectedItem.status === 'pending' ? 'clock.fill' : 'checkmark.circle.fill'} 
                      size={14} 
                      color={selectedItem.status === 'pending' ? '#FF9500' : '#0A7EA4'} 
                    />
                    <Text style={[
                      styles.modalStatusText,
                      {color: selectedItem.status === 'pending' ? '#FF9500' : '#0A7EA4'}
                    ]}>
                      {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalDetailsList}>
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Transaction ID</Text>
                    <Text style={styles.modalDetailValue}>#{selectedItem.id}</Text>
                  </View>
                  
                  <View style={styles.modalDetailDivider} />
                  
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>User ID</Text>
                    <Text style={styles.modalDetailValue}>{selectedItem.userId}</Text>
                  </View>
                  
                  <View style={styles.modalDetailDivider} />
                  
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Date</Text>
                    <Text style={styles.modalDetailValue}>{selectedItem.date}</Text>
                  </View>
                  
                  <View style={styles.modalDetailDivider} />
                  
                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Notes</Text>
                    <Text style={styles.modalDetailValue}>{selectedItem.notes}</Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.modalActionButton}>
                  <Text style={styles.modalActionButtonText}>View Full Receipt</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  
  // ===== Header Section =====
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ===== Balance Card =====
  balanceCardContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  balanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceCardContent: {
    padding: 16,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  monthlyChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  monthlyChangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    marginLeft: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  
  // ===== Search Section =====
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  
  // ===== Tabs Section =====
  tabsSection: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#e6f6fd',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0A7EA4',
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  
  // ===== Transaction List =====
  transactionsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionNotes: {
    fontSize: 12,
    color: '#64748B',
  },
  
  // ===== Empty State =====
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 10,
  },
  
  // ===== Modal =====
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.65,
    paddingBottom: 20,
    zIndex: 2,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  modalCloseBtn: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  modalStatusContainer: {
    marginBottom: 24,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalStatusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  modalDetailsList: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    textAlign: 'right',
  },
  modalDetailDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  modalActionButton: {
    backgroundColor: '#0A7EA4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalActionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
