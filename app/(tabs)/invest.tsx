import InvestHeader from '@/components/InvestHeader'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native'
import { api } from '@/constants/Backend'
import * as WebBrowser from 'expo-web-browser'
import { LineChart } from 'react-native-gifted-charts'

const FALLBACK_EXPENSES = [
  { id: '1', title: 'Expense 1', note: 'Groceries', time: '4:06 PM', amount: 1500 },
  { id: '2', title: 'Expense 2', note: 'Transport', time: '10:15 AM', amount: 500 },
  { id: '3', title: 'Expense 3', note: 'Freelance (income)', time: '8:05 AM', amount: -2000 },
]

const FALLBACK_INVESTMENTS = [
  { id: 'i1', name: 'High Yield Savings', desc: 'Low risk, stable returns', min: 500, url: 'https://www.bankrate.com/banking/savings/best-high-yield-interests-savings-accounts/' },
  { id: 'i2', name: 'Index Fund', desc: 'Diversified stock exposure', min: 1000, url: 'https://investor.vanguard.com/investment-products/index-funds' },
  { id: 'i3', name: 'Corporate Bonds', desc: 'Fixed income, moderate risk', min: 2000, url: 'https://www.fidelity.com/fixed-income-bonds/corporate-bonds' },
]

const FALLBACK_CURRENCIES = {
  INR: { label: 'Indian Rupee', symbol: '₹', flag: require('@/assets/svgs/indian.svg') },
  USD: { label: 'US Dollar', symbol: '$', flag: require('@/assets/svgs/us.svg') },
  CNY: { label: 'Chinese Yuan', symbol: '¥', flag: require('@/assets/svgs/china.svg') },
}

const currencies = FALLBACK_CURRENCIES

// Exchange rates (static, base = INR). Multiply base-INR -> target currency.
const exchangeRates: Record<string, number> = {
  INR: 1,// 1 INR ≈ 0.012 USD (example), 0.085 CNY
  USD: 0.012,
  CNY: 0.085,
}

// Convert amount from base (INR) into currently selected currency
const convert = (amountInINR: number, targetCurrency: keyof typeof FALLBACK_CURRENCIES) => {
  const rate = exchangeRates[targetCurrency] ?? 1
  return amountInINR * rate
}

const formatCurrency = (amountInINR: number, targetCurrency: keyof typeof FALLBACK_CURRENCIES, currencyMap: typeof FALLBACK_CURRENCIES) => {
  const converted = convert(amountInINR, targetCurrency)
  const opts: Intl.NumberFormatOptions = Math.abs(converted) < 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }
  return `${currencyMap[targetCurrency]?.symbol || '₹'}${converted.toLocaleString(undefined, opts)}`
}

const MONTHLY_BUDGET = 20000
const SPENT = 5000

const Invest = () => {
  const [currency, setCurrency] = useState<'INR'|'USD'|'CNY'>('INR')
  const [currencyMap, setCurrencyMap] = useState<typeof FALLBACK_CURRENCIES>(FALLBACK_CURRENCIES)
  const symbol = currencyMap[currency]?.symbol || '₹'
  const remaining = MONTHLY_BUDGET - SPENT
  const progressPct = Math.min(1, SPENT / MONTHLY_BUDGET) * 100

  const handleInvestPress = async (investment: any) => {
    try {
      await WebBrowser.openBrowserAsync(investment.url || 'https://www.investopedia.com/investing-4427685')
    } catch (error) {
      console.warn('Failed to open browser:', error)
    }
  }

  const handleCreateRecurring = async () => {
    if (!recurringForm.amount || !recurringForm.investmentType) {
      Alert.alert('Error', 'Please fill in amount and investment type')
      return
    }

    try {
      const response = await fetch(api('/api/investments/recurring'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(recurringForm.amount),
          frequency: recurringForm.frequency,
          startDate: recurringForm.startDate,
          endDate: recurringForm.endDate || null,
          investmentType: recurringForm.investmentType,
          currency
        })
      })
      
      if (response.ok) {
        Alert.alert('Success', 'Recurring investment created successfully')
        setShowRecurringModal(false)
        setRecurringForm({ amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], endDate: '', investmentType: '' })
      } else {
        Alert.alert('Error', 'Failed to create recurring investment')
      }
    } catch (error) {
      console.warn('Failed to create recurring investment:', error)
      Alert.alert('Error', 'Failed to create recurring investment')
    }
  }
  // state populated from backend when available
  const [expenses, setExpenses] = useState(FALLBACK_EXPENSES)
  const [investments, setInvestments] = useState(FALLBACK_INVESTMENTS)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [isInvestmentOptionsExpanded, setIsInvestmentOptionsExpanded] = useState(false)
  const [recurringForm, setRecurringForm] = useState({
    amount: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    investmentType: ''
  })
  const [investmentData, setInvestmentData] = useState([
    { value: 0, label: 'Jul' },
    { value: 0, label: 'Aug' },
    { value: 0, label: 'Sep' },
    { value: 0, label: 'Oct' },
    { value: 0, label: 'Nov' },
    { value: 0, label: 'Dec' },
  ])
  const [expenseData, setExpenseData] = useState([
    { value: 0, label: 'Jul' },
    { value: 3500, label: 'Aug' },
    { value: 0, label: 'Sep' },
    { value: 4200, label: 'Oct' },
    { value: 2800, label: 'Nov' },
    { value: 5000, label: 'Dec' },
  ])
  const [recentInvestments, setRecentInvestments] = useState([
    { id: '1', name: 'Index Fund', amount: 5000, date: '2024-01-15', profit: 250 },
    { id: '2', name: 'Corporate Bonds', amount: 3000, date: '2024-01-10', profit: -50 },
  ])

  const handleAddInvestment = () => {
    Alert.alert('Add Investment', 'Feature coming soon!')
  }

  const handleCalculateProfits = () => {
    const totalProfit = recentInvestments.reduce((sum, inv) => sum + inv.profit, 0)
    Alert.alert('Total Profits', `Your total profit/loss: ${formatCurrency(totalProfit, currency, currencyMap)}`)
  }

  // fetch backend data on mount (inside component so setState is available)
  useEffect(() => {
    let mounted = true

    fetch(api('/api/expenses'))
      .then(r => r.json())
      .then(list => {
        if (!mounted) return
        if (Array.isArray(list) && list.length) setExpenses(list)
      })
      .catch(() => console.warn('No /api/expenses available - using fallback'));

  
    fetch(api('/api/investments'))
      .then((r) => r.json()) 
      .then(list => {
        if (!mounted) return
        if (Array.isArray(list) && list.length) setInvestments(list)
      })
      .catch(() => console.warn('No /api/investments available - using fallback'));

    fetch(api('/api/currencies'))
      .then(r => r.json())
      .then(map => {
        if (!mounted) return
        if (map && typeof map === 'object') setCurrencyMap(map)
      })
      .catch(() => console.warn('No /api/currencies available - using fallback'));

    fetch(api('/api/investment-chart'))
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (Array.isArray(data) && data.length) setInvestmentData(data)
      })
      .catch(() => console.warn('No /api/investment-chart available - using fallback'));

    fetch(api('/api/expense-chart'))
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (Array.isArray(data) && data.length) setExpenseData(data)
      })
      .catch(() => console.warn('No /api/expense-chart available - using fallback'));

    return () => { mounted = false }
  }, [])

  return (
    <>
      <InvestHeader />

      <View style={styles.container}>
        {/* Investment Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Investment Performance</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={investmentData}
              width={300}
              height={150}
              color={Colors.tintColor}
              thickness={2}
              startFillColor={Colors.tintColor}
              endFillColor={Colors.tintColor}
              startOpacity={0.3}
              endOpacity={0.1}
              areaChart
              hideDataPoints={false}
              dataPointsColor={Colors.tintColor}
              dataPointsRadius={4}
              textColor={Colors.gray}
              textFontSize={12}
              hideRules
              hideYAxisText
              xAxisColor={Colors.gray}
              yAxisColor={Colors.gray}
              backgroundColor={Colors.black}
            />
          </View>
          <Text style={styles.chartSubtitle}>Last 6 months • No investments yet</Text>
        </View>

        {/* Auto Investment Button */}
        <TouchableOpacity style={styles.autoInvestBtn} onPress={() => setShowRecurringModal(true)}>
          <Text style={styles.autoInvestText}>+ Set Up Auto Investment</Text>
        </TouchableOpacity>

        {/* Investment options section */}
        <View style={styles.investSection}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => setIsInvestmentOptionsExpanded(!isInvestmentOptionsExpanded)}
          >
            <Text style={styles.sectionTitle}>Investment Options</Text>
            <Ionicons 
              name={isInvestmentOptionsExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={Colors.white} 
            />
          </TouchableOpacity>
          {isInvestmentOptionsExpanded && investments.map((opt) => (
            <View key={opt.id} style={styles.investCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.investTitle}>{opt.name}</Text>
                <Text style={styles.investDesc}>{opt.desc}</Text>
                <Text style={styles.investMin}>{`Min: ${formatCurrency(opt.min, currency, currencyMap)}`}</Text>
              </View>
              <TouchableOpacity style={styles.investCTA} onPress={() => handleInvestPress(opt)}>
                <Text style={styles.ctaText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Investment Actions */}
        <View style={styles.investActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAddInvestment}>
            <Text style={styles.actionBtnText}>+ Add Investment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCalculateProfits}>
            <Text style={styles.actionBtnText}>Calculate Profits</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Investments */}
        <View style={styles.recentInvestments}>
          <Text style={styles.sectionTitle}>Recent Investments</Text>
          {recentInvestments.map((inv) => {
            const isProfit = inv.profit > 0
            return (
              <View key={inv.id} style={styles.investmentRow}>
                <View style={styles.investmentInfo}>
                  <Text style={styles.investmentName}>{inv.name}</Text>
                  <Text style={styles.investmentDate}>{inv.date} • {formatCurrency(inv.amount, currency, currencyMap)}</Text>
                </View>
                <Text style={[styles.profitAmount, isProfit ? styles.profit : styles.loss]}>
                  {isProfit ? '+' : ''}{formatCurrency(inv.profit, currency, currencyMap)}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* Recurring Investment Modal */}
      <Modal visible={showRecurringModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Up Auto Investment</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={Colors.gray}
              value={recurringForm.amount}
              onChangeText={(text) => setRecurringForm({...recurringForm, amount: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Investment Type (e.g., Index Fund)"
              placeholderTextColor={Colors.gray}
              value={recurringForm.investmentType}
              onChangeText={(text) => setRecurringForm({...recurringForm, investmentType: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              placeholderTextColor={Colors.gray}
              value={recurringForm.startDate}
              onChangeText={(text) => setRecurringForm({...recurringForm, startDate: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="End Date (Optional, YYYY-MM-DD)"
              placeholderTextColor={Colors.gray}
              value={recurringForm.endDate}
              onChangeText={(text) => setRecurringForm({...recurringForm, endDate: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRecurringModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateRecurring}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  chartSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  chartSubtitle: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoInvestBtn: {
    backgroundColor: Colors.tintColor,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  autoInvestText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  investSection: {
    marginTop: 18,
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
    borderWidth: 1,
    borderColor: Colors.grey,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0d1417',
    color: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.grey,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: Colors.grey,
    padding: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  createBtn: {
    backgroundColor: Colors.tintColor,
    padding: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  cancelText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  createText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
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
  investActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  actionBtn: {
    backgroundColor: Colors.tintColor,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  recentInvestments: {
    marginTop: 20,
    marginBottom: 40,
  },
  investmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#071012',
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  investmentDate: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 4,
  },
  profitAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  profit: {
    color: Colors.green,
  },
  loss: {
    color: '#ff6b6b',
  },
})