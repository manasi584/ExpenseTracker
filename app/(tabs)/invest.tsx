import InvestHeader from '@/components/InvestHeader'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const sampleExpenses = [
  // amounts stored in base currency (INR)
  { id: '1', title: 'Expense 1', note: 'Groceries', time: '4:06 PM', amount: 1500 },
  { id: '2', title: 'Expense 2', note: 'Transport', time: '10:15 AM', amount: 500 },
  { id: '3', title: 'Expense 3', note: 'Freelance (income)', time: '8:05 AM', amount: -2000 }, // negative = income
];

const investmentOptions = [
  { id: 'i1', name: 'High Yield Savings', desc: 'Low risk, stable returns', min: 500 },
  { id: 'i2', name: 'Index Fund', desc: 'Diversified stock exposure', min: 1000 },
  { id: 'i3', name: 'Corporate Bonds', desc: 'Fixed income, moderate risk', min: 2000 },
];

const currencies = {
  INR: { label: 'Indian Rupee', symbol: '₹', flag: require('@/assets/svgs/indian.svg') },
  USD: { label: 'US Dollar', symbol: '$', flag: require('@/assets/svgs/us.svg') },
  CNY: { label: 'Chinese Yuan', symbol: '¥', flag: require('@/assets/svgs/china.svg') },
}

// Exchange rates (static, base = INR). Multiply base-INR -> target currency.
const exchangeRates: Record<string, number> = {
  INR: 1,
  // 1 INR ≈ 0.012 USD (example), 0.085 CNY
  USD: 0.012,
  CNY: 0.085,
}

// Convert amount from base (INR) into currently selected currency
const convert = (amountInINR: number, targetCurrency: keyof typeof currencies) => {
  const rate = exchangeRates[targetCurrency] ?? 1
  return amountInINR * rate
}

const formatCurrency = (amountInINR: number, targetCurrency: keyof typeof currencies) => {
  const converted = convert(amountInINR, targetCurrency)
  // show 0-2 decimals for small values, otherwise drop decimals
  const opts: Intl.NumberFormatOptions = Math.abs(converted) < 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }
  return `${currencies[targetCurrency].symbol}${converted.toLocaleString(undefined, opts)}`
}

const MONTHLY_BUDGET = 20000
const SPENT = 5000

const Invest = () => {
  const [currency, setCurrency] = useState<'INR'|'USD'|'CNY'>('INR')
  const symbol = currencies[currency].symbol
  const remaining = MONTHLY_BUDGET - SPENT
  const progressPct = Math.min(1, SPENT / MONTHLY_BUDGET) * 100

  return (
    <>
      <InvestHeader />

      <View style={styles.container}>
        {/* Currency header (flag + selector) */}
        <View style={{ paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source={currencies[currency].flag} style={{ width: 30, height: 30 }} />
            <Text style={{ color: Colors.white, fontSize: 16, fontWeight: 'bold' }}>{currencies[currency].label}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 8 }}>
            { (Object.keys(currencies) as (keyof typeof currencies)[]).map(k => (
              <TouchableOpacity key={k} onPress={() => setCurrency(k)} style={{ padding: 6 }}>
                <Image source={currencies[k].flag} style={{ width: 24, height: 24, opacity: currency === k ? 1 : 0.45 }} />
              </TouchableOpacity>
            )) }
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="ellipsis-vertical" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.budgetAmount}>{formatCurrency(MONTHLY_BUDGET, currency)}</Text>

          <View style={styles.row}>
            <View>
              <Text style={styles.smallLabel}>Spent</Text>
              <Text style={styles.spent}>{formatCurrency(SPENT, currency)}</Text>
            </View>

            <View>
              <Text style={styles.smallLabel}>Remaining</Text>
              <Text style={styles.remaining}>{formatCurrency(remaining, currency)}</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="remove" size={16} color={Colors.white} />
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="add" size={16} color={Colors.white} />
              <Text style={styles.actionText}>Add Income</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.ghostBtn]}>
              <Ionicons name="settings-outline" size={16} color={Colors.white} />
              <Text style={styles.actionText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categories}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.catRow}>
            <TouchableOpacity style={styles.catBtn}>
              <Image source={require('@/assets/svgs/wallet.svg')} style={styles.catIcon} />
              <Text style={styles.catText}>Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.catBtn}>
              <Image source={require('@/assets/svgs/airtime.svg')} style={styles.catIcon} />
              <Text style={styles.catText}>Airtime</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.catBtn}>
              <Image source={require('@/assets/svgs/bills.svg')} style={styles.catIcon} />
              <Text style={styles.catText}>Bills</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.catBtn}>
              <Image source={require('@/assets/svgs/send.svg')} style={styles.catIcon} />
              <Text style={styles.catText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Investment options section */}
        <View style={styles.investSection}>
          <Text style={styles.sectionTitle}>Investment Options</Text>
          {investmentOptions.map((opt) => (
            <View key={opt.id} style={styles.investCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.investTitle}>{opt.name}</Text>
                <Text style={styles.investDesc}>{opt.desc}</Text>
                <Text style={styles.investMin}>{`Min: ${formatCurrency(opt.min, currency)}`}</Text>
              </View>
              <TouchableOpacity style={styles.investCTA}>
                <Text style={styles.ctaText}>Invest</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.recent}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {sampleExpenses.map((t) => {
            const isIncome = t.amount < 0
            return (
              <View key={t.id} style={styles.txRow}>
                <Image source={require('@/assets/svgs/gtco.svg')} style={styles.txIcon} />
                <View style={styles.txText}>
                  <Text style={styles.txTitle}>{t.title}</Text>
                  <Text style={styles.txNote}>{t.note} • {t.time}</Text>
                </View>
                <Text style={[styles.txAmount, isIncome ? styles.income : styles.expense]}>
                  {isIncome ? '+' : ''}{formatCurrency(Math.abs(t.amount), currency)}
                </Text>
              </View>
            )
          })}

          <TouchableOpacity style={styles.viewMore}>
            <Image source={require('@/assets/svgs/search.svg')} style={{ width: 20, height: 20, marginRight: 8 }} />
            <Text style={styles.viewMoreText}>View All Transactions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default Invest

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryCard: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.gray,
    fontSize: 13,
  },
  settingsBtn: {
    padding: 6,
  },
  budgetAmount: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  smallLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  spent: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  remaining: {
    color: Colors.tintColor,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#142127',
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.tintColor,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ghostBtn: {
    backgroundColor: '#11161a',
  },
  actionText: {
    color: Colors.white,
    marginLeft: 8,
    fontWeight: '700',
  },
  categories: {
    marginTop: 18,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catBtn: {
    backgroundColor: Colors.grey,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '23%',
  },
  catIcon: {
    width: 26,
    height: 26,
    marginBottom: 6,
  },
  catText: {
    color: Colors.white,
    fontSize: 12,
    textAlign: 'center',
  },
  investSection: {
    marginTop: 18,
  },
  investCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1417',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  investTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  investDesc: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 4,
  },
  investMin: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 6,
  },
  investCTA: {
    backgroundColor: Colors.tintColor,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '700',
  },
  recent: {
    marginTop: 18,
    marginBottom: 40,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#071012',
  },
  txIcon: {
    width: 40,
    height: 40,
  },
  txText: {
    flex: 1,
    marginLeft: 12,
  },
  txTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  txNote: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  expense: {
    color: Colors.white,
  },
  income: {
    color: Colors.green,
  },
  viewMore: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: Colors.grey,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMoreText: {
    color: Colors.white,
    fontWeight: '700',
  },
})