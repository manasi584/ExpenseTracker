import CardHeader from "@/components/CardHeader";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const sampleExpenses = [
  { id: '1', title: 'Expense 1', detail: 'Groceries', time: '4:06 PM', amount: 1500 },
  { id: '2', title: 'Expense 2', detail: 'Transport', time: '10:15 AM', amount: 500 },
  { id: '3', title: 'Expense 3', detail: 'Salary (income)', time: '8:05 AM', amount: -2000 }, // negative = income
];

const BUDGET = 20000;
const SPENT = 5000; // sample

const Page = () => {
  const remaining = BUDGET - SPENT;
  const progress = Math.min(1, SPENT / BUDGET);

  return (
    <>
      <CardHeader />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Monthly Budget</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLarge}>₹{BUDGET.toLocaleString()}</Text>
            <View style={styles.smallAmounts}>
              <Text style={styles.spent}>Spent: ₹{SPENT.toLocaleString()}</Text>
              <Text style={styles.remaining}>Remaining: ₹{remaining.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.ghostBtn]}>
              <Ionicons name="settings-outline" size={18} color={Colors.white} />
              <Text style={styles.actionText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {sampleExpenses.map((item) => {
            const isIncome = item.amount < 0;
            return (
              <View key={item.id} style={styles.expenseRow}>
                <Image
                  source={require('@/assets/svgs/wallet.svg')}
                  style={styles.expenseIcon}
                />
                <View style={styles.expenseText}>
                  <Text style={styles.expenseTitle}>{item.title}</Text>
                  <Text style={styles.expenseDetail}>{item.detail} • {item.time}</Text>
                </View>
                <Text style={[styles.expenseAmount, isIncome ? styles.income : styles.outcome]}>
                  {isIncome ? '+' : '₹'}{Math.abs(item.amount).toLocaleString()}
                </Text>
              </View>
            );
          })}

          <TouchableOpacity style={styles.viewMore}>
            <Image
              source={require('@/assets/svgs/search.svg')}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: Colors.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLarge: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  smallAmounts: {
    alignItems: 'flex-end',
  },
  spent: {
    color: Colors.gray,
    fontSize: 12,
  },
  remaining: {
    color: Colors.tintColor,
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1f2933',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.tintColor,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  ghostBtn: {
    backgroundColor: '#162028',
  },
  actionText: {
    color: Colors.white,
    marginLeft: 8,
    fontWeight: '700',
  },
  listSection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0b1114',
  },
  expenseIcon: {
    width: 40,
    height: 40,
  },
  expenseText: {
    flex: 1,
    marginLeft: 12,
  },
  expenseTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  expenseDetail: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  income: {
    color: Colors.green,
  },
  outcome: {
    color: Colors.white,
  },
  viewMore: {
    marginTop: 18,
    flexDirection: 'row',
    backgroundColor: Colors.grey,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMoreText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
