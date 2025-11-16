import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  const [showTransactions, setShowTransactions] = React.useState(false);

  const lastTransactions = [
    { id: 't1', title: 'Grocery Store', date: '08/12/2025', time: '4:06 PM', amount: -1500 },
    { id: 't2', title: 'Taxi', date: '08/12/2025', time: '10:15 AM', amount: -500 },
    { id: 't3', title: 'Salary', date: '08/11/2025', time: '8:05 AM', amount: 2000 },
    { id: 't4', title: 'Coffee', date: '08/10/2025', time: '9:30 AM', amount: -200 },
    { id: 't5', title: 'Utility Bill', date: '08/09/2025', time: '6:20 PM', amount: -1200 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.wrapper}
      >
        <View style={styles.userInfoWrapper}>
          <Image
            source={require('@/assets/images/user.png')}
            style={styles.userImg}
          />
          <View style={styles.userTxtWrapper}>
            <Text style={[styles.userText, { fontSize: 12 }]}>Hi, username1</Text>
            <Text style={[styles.userText, { fontSize: 16 }]}>
              Your <Text style={styles.boldText}>Budget</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowTransactions(true)}
          style={styles.btnWrapper}
        >
          <Text style={styles.btnText}>
            My Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions modal */}
      <Modal visible={showTransactions} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Last 5 Transactions</Text>
              <TouchableOpacity onPress={() => setShowTransactions(false)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={lastTransactions}
              keyExtractor={(i) => i.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.txRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{item.title}</Text>
                    <Text style={styles.txMeta}>{item.date} • {item.time}</Text>
                  </View>
                  <Text style={[styles.txAmount, item.amount > 0 ? styles.income : styles.outcome]}>
                    {item.amount > 0 ? '+' : '₹'}{Math.abs(item.amount).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Header;


export const UserHeader = () => {
  return (
    <SafeAreaView style={{ marginTop: -30 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          height: 70,
          alignItems: "center",
        }}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Image
            source={require('@/assets/images/user.png')}
            style={{
              height: 70,
              width: 70,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: Colors.tintColor,
            }}
          />
          <View style={styles.userTxtWrapper}>
            <Text style={[styles.userText, { fontSize: 18, fontWeight: "bold" }]}>John Doe (username1)</Text>
            <Text style={[styles.userText, { fontSize: 15, color: Colors.gray }]}>
              Account Details
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { }}
          style={{
            borderColor: "#666",
            borderWidth: 1,
            padding: 6,
            borderRadius: 50,
          }}
        >
          <Ionicons name="chevron-forward" size={24} color={Colors.white} style={{
            color: Colors.white,
            fontWeight: 'bold',
            fontSize: 26,
            textAlign: 'center',
          }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: -20,
  },
  userImg: {
    height: 50,
    width: 50,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.tintColor,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  userTxtWrapper: {
    marginLeft: 10,
  },
  userText: {
    color: Colors.white,
  },
  boldText: {
    fontWeight: '700',
  },
  btnWrapper: {
    borderColor: "#666",
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
  },
  btnText: {
    color: Colors.white,
    fontSize: 12,
  },
  /* modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    maxHeight: '70%',
    backgroundColor: '#071014',
    borderRadius: 12,
    padding: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0b1114',
  },
  txTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  txMeta: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  income: {
    color: Colors.green,
  },
  outcome: {
    color: Colors.white,
  },
});
