import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Hr from "./ui/Hr";
import React, { useState } from "react";
import { api } from "@/constants/Backend";

const CardHeader = () => {
  const [loading, setLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [cardsSummary, setCardsSummary] = useState([]);

  const handleCardsSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(api('/api/cards/summary'));
      const result = await response.json();
      setCardsSummary(result);
      setShowSummaryModal(true);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch cards summary');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.wrapper}
      >
        <View style={styles.userInfoWrapper}>
          <Text style={styles.boldText}>Cards</Text>
          <TouchableOpacity
            style={styles.summaryBtn}
            onPress={handleCardsSummary}
            disabled={loading}
          >
            <Text style={styles.summaryBtnText}>
              {loading ? 'Loading...' : 'Cards Summary'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Hr />
      
      <Modal visible={showSummaryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cards Summary</Text>
              <TouchableOpacity onPress={() => setShowSummaryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {cardsSummary.length === 0 ? (
              <Text style={styles.noCardsText}>No cards found</Text>
            ) : (
              <>
                <View style={styles.statusSummary}>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusCount}>{cardsSummary.filter(card => card.status?.toLowerCase() === 'pending').length}</Text>
                    <Text style={styles.statusLabel}>Pending</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusCount}>{cardsSummary.filter(card => card.status?.toLowerCase() === 'approval').length}</Text>
                    <Text style={styles.statusLabel}>Approval</Text>
                  </View>
                </View>
                
                {cardsSummary.map((card, index) => (
                  <View key={index} style={styles.cardSummaryItem}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardType}>{card.cardType} Card</Text>
                      <Text style={styles.cardHolder}>Cardholder: {card.cardholder}</Text>
                      <Text style={styles.cardStatus}>Status: {card.status}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CardHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.white,
    fontSize: 24,
  },
  btnWrapper: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    display: "flex",
    backgroundColor: Colors.tintColor,
    borderRadius: 50,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 40,
    marginRight: 5
  },
  summaryBtn: {
    backgroundColor: '#0f1720',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.tintColor,
  },
  summaryBtnText: {
    color: Colors.tintColor,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.black,
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  noCardsText: {
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 20,
  },
  cardSummaryItem: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardHolder: {
    color: Colors.gray,
    fontSize: 14,
    marginBottom: 4,
  },
  cardStatus: {
    color: Colors.tintColor,
    fontSize: 14,
    fontWeight: '600',
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusCount: {
    color: Colors.tintColor,
    fontSize: 24,
    fontWeight: '700',
  },
  statusLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
});
