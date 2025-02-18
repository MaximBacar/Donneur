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

// Static data for now; replace with real data once backend is connected
const withdrawalsData = [
  {
    id: 1,
    name: 'John Doe',
    date: 'Feb 1, 2023',
    amount: '$100.00',
  },
  {
    id: 2,
    name: 'Jane Smith',
    date: 'Feb 3, 2023',
    amount: '$50.00',
  },
  {
    id: 3,
    name: 'Carlos Diaz',
    date: 'Feb 5, 2023',
    amount: '$75.00',
  },
  {
    id: 4,
    name: 'Emily Johnson',
    date: 'Feb 6, 2023',
    amount: '$20.00',
  },
  {
    id: 5,
    name: 'Michael Brown',
    date: 'Feb 8, 2023',
    amount: '$200.00',
  },
  {
    id: 6,
    name: 'John Doe',
    date: 'Feb 1, 2023',
    amount: '$100.00',
  },
  {
    id: 7,
    name: 'Jane Smith',
    date: 'Feb 3, 2023',
    amount: '$50.00',
  },
  {
    id: 8,
    name: 'Carlos Diaz',
    date: 'Feb 5, 2023',
    amount: '$75.00',
  },
  {
    id: 9,
    name: 'Emily Johnson',
    date: 'Feb 6, 2023',
    amount: '$20.00',
  },
  {
    id: 10,
    name: 'Michael Brown',
    date: 'Feb 8, 2023',
    amount: '$200.00',
  },
  // ... add more as needed
];

export default function FinanceScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ========== TOP CARD (Finance Details) ========== */}
        <View style={styles.topCard}>
          <Text style={styles.cardTitle}>Finance Overview</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={styles.balanceValue}>$1,234.56</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Pending Transactions:</Text>
            <Text style={styles.balanceValue}>$230.00</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Last Updated:</Text>
            <Text style={styles.balanceValue}>Feb 10, 2023</Text>
          </View>
        </View>

        {/* ========== MONEY WITHDRAWN SECTION ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Money Withdrawn</Text>

          {/* Scrollable list of withdrawals */}
          {withdrawalsData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.withdrawalItem}
              onPress={() => openModal(item)}
            >
              <View style={styles.withdrawalInfo}>
                <Text style={styles.withdrawalName}>{item.name}</Text>
                <Text style={styles.withdrawalDate}>{item.date}</Text>
              </View>
              <Text style={styles.withdrawalAmount}>{item.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ========== MODAL ========== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalText}>
                  Date: {selectedItem.date}
                </Text>
                <Text style={styles.modalText}>
                  Amount: {selectedItem.amount}
                </Text>
                {/* Add more details as needed */}
              </>
            )}
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ========== STYLES ==========
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
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    // Elevation (Android)
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#555',
  },
  balanceValue: {
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
  withdrawalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    // Elevation (Android)
    elevation: 1,
  },
  withdrawalInfo: {
    flexDirection: 'column',
  },
  withdrawalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  withdrawalDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  withdrawalAmount: {
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
