import Header from '@/components/Header'
import { Colors } from '@/constants/Colors'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const currencies = {
  INR: { label: 'Indian Rupee', symbol: '₹', flag: require('@/assets/svgs/indian.svg') },
  USD: { label: 'US Dollar', symbol: '$', flag: require('@/assets/svgs/us.svg') },
  CNY: { label: 'Chinese Yuan', symbol: '¥', flag: require('@/assets/svgs/china.svg') },
}

const sampleExpenses = [
  { id: '1', title: 'Expense 1', detail: 'Groceries', time: '4:06 PM', amount: 1500 },
  { id: '2', title: 'Expense 2', detail: 'Transport', time: '10:15 AM', amount: 500 },
  { id: '3', title: 'Expense 3', detail: 'Salary (income)', time: '8:05 AM', amount: -2000 }, // negative = income
];

const BUDGET = 20000;
const SPENT = 5000; // sample

const HomeScreen = () => {
  const [currency, setCurrency] = useState<'INR'|'USD'|'CNY'>('INR')
  const symbol = currencies[currency].symbol
  const remaining = BUDGET - SPENT
  const progress = Math.min(1, SPENT / BUDGET)

  return (
    <>
      <Header />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* currency selector */}
          <View style={styles.currencyRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={currencies[currency].flag} style={{ width: 30, height: 30 }} />
              <Text style={styles.currencyLabel}>{currencies[currency].label}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8 }}>
              { (Object.keys(currencies) as (keyof typeof currencies)[]).map((k) => (
                <TouchableOpacity key={k} onPress={() => setCurrency(k)} style={{ padding: 6 }}>
                  <Image source={currencies[k].flag} style={{ width: 24, height: 24, opacity: currency === k ? 1 : 0.45 }} />
                </TouchableOpacity>
              )) }
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Monthly Budget</Text>

            <View style={styles.amountRow}>
              <Text style={styles.amountLarge}>{symbol}{BUDGET.toLocaleString()}</Text>
              <View style={styles.smallAmounts}>
                <Text style={styles.spent}>Spent: {symbol}{SPENT.toLocaleString()}</Text>
                <Text style={styles.remaining}>Remaining: {symbol}{remaining.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>Add Expense</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.ghostBtn]}>
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
                  <Image source={require('@/assets/svgs/wallet.svg')} style={styles.expenseIcon} />
                  <View style={styles.expenseText}>
                    <Text style={styles.expenseTitle}>{item.title}</Text>
                    <Text style={styles.expenseDetail}>{item.detail} • {item.time}</Text>
                  </View>
                  <Text style={[styles.expenseAmount, isIncome ? styles.income : styles.outcome]}>
                    {isIncome ? '+' : symbol}{Math.abs(item.amount).toLocaleString()}
                  </Text>
                </View>
              );
            })}

            <TouchableOpacity style={styles.viewMore}>
              <Image source={require('@/assets/svgs/search.svg')} style={{ width: 20, height: 20, marginRight: 8 }} />
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  currencyRow: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  currencyLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 20,
    margin: 16,
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
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.grey,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ghostBtn: {
    backgroundColor: '#162028',
  },
  actionText: {
    color: Colors.white,
    fontWeight: '700',
  },

  listSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
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
})