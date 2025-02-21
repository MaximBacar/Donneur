import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Mock data for past transactions
const transactionsData = [
  {
    id: 1,
    description: 'Payment received from John Doe',
    date: 'Mar 1, 2023',
    amount: '$150.00',
  },
  {
    id: 2,
    description: 'Refund issued to Jane Smith',
    date: 'Mar 3, 2023',
    amount: '-$25.00',
  },
  {
    id: 3,
    description: 'Payment received from Carlos Diaz',
    date: 'Mar 5, 2023',
    amount: '$200.00',
  },
  {
    id: 4,
    description: 'Service fee charged',
    date: 'Mar 6, 2023',
    amount: '-$10.00',
  },
  {
    id: 5,
    description: 'Payment received from Emily Johnson',
    date: 'Mar 8, 2023',
    amount: '$80.00',
  },
  // ... add more transactions as needed
];

export default function PastTransactionsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ========== TOP CARD (Overview) ========== */}
        <View style={styles.topCard}>
          <Text style={styles.cardTitle}>Past Transactions Overview</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Transactions:</Text>
            <Text style={styles.summaryValue}>{transactionsData.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Amount:</Text>
            <Text style={styles.summaryValue}>$375.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Last Updated:</Text>
            <Text style={styles.summaryValue}>Mar 10, 2023</Text>
          </View>
        </View>

        {/* ========== TRANSACTIONS LIST ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions</Text>

          {transactionsData.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => openModal(transaction)}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDesc}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={styles.transactionAmount}>{transaction.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ========== MODAL FOR TRANSACTION DETAILS ========== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTransaction && (
              <>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <Text style={styles.modalText}>
                  Description: {selectedTransaction.description}
                </Text>
                <Text style={styles.modalText}>
                  Date: {selectedTransaction.date}
                </Text>
                <Text style={styles.modalText}>
                  Amount: {selectedTransaction.amount}
                </Text>
                {/* Additional details can be added here */}
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    // Elevation for Android
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    // Elevation for Android
    elevation: 1,
  },
  transactionInfo: {
    flexDirection: 'column',
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
  },
});
