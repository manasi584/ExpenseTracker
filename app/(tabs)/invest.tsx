import InvestHeader from '@/components/InvestHeader'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, ScrollView, RefreshControl } from 'react-native'
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

  const fetchRecentInvestments = async () => {
    try {
      const [investmentsResponse, expensesResponse] = await Promise.all([
        fetch(api('/api/investments/recent')),
        fetch(api('/api/expenses'))
      ])
      
      const investmentsData = await investmentsResponse.json()
      const expensesData = await expensesResponse.json()
      
      const allInvestments = []
      
      if (Array.isArray(investmentsData)) {
        allInvestments.push(...investmentsData)
      }
      
      if (Array.isArray(expensesData)) {
        const investmentExpenses = expensesData
          .filter(expense => expense.category === 'Investment' && expense.amount < 0)
          .map(expense => ({
            id: `expense-${expense._id}`,
            name: expense.title,
            amount: Math.abs(expense.amount),
            date: expense.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            profit: 0
          }))
        allInvestments.push(...investmentExpenses)
      }
      
      allInvestments.sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecentInvestments(allInvestments.slice(0, 10))
    } catch (error) {
      console.warn('Failed to fetch recent investments:', error)
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
        // Refresh recent investments
        fetchRecentInvestments()
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
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false)
  const [addInvestmentForm, setAddInvestmentForm] = useState({ title: '', amount: '' })
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
  const [recentInvestments, setRecentInvestments] = useState([])
  const [stocks, setStocks] = useState([])
  const [portfolioSummary, setPortfolioSummary] = useState({ totalValue: 0, totalCost: 0, totalProfit: 0, profitPercentage: 0 })
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [addStockForm, setAddStockForm] = useState({ symbol: '', name: '', quantity: '', purchasePrice: '' })
  const [refreshing, setRefreshing] = useState(false)

  const handleAddInvestment = () => {
    setShowAddInvestmentModal(true)
  }

  const handleCreateInvestment = async () => {
    if (!addInvestmentForm.title || !addInvestmentForm.amount) {
      Alert.alert('Error', 'Please fill in title and amount')
      return
    }

    try {
      const response = await fetch(api('/api/expenses'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addInvestmentForm.title,
          category: 'Investment',
          amount: -Math.abs(parseFloat(addInvestmentForm.amount))
        })
      })
      
      if (response.ok) {
        Alert.alert('Success', 'Investment added successfully')
        setShowAddInvestmentModal(false)
        setAddInvestmentForm({ title: '', amount: '' })
        fetchRecentInvestments()
      } else {
        Alert.alert('Error', 'Failed to add investment')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add investment')
    }
  }

  const handleCalculateProfits = () => {
    const investmentProfit = recentInvestments.reduce((sum, inv) => sum + inv.profit, 0)
    const stockProfit = portfolioSummary.totalProfit
    const totalProfit = investmentProfit + stockProfit
    Alert.alert('Total Portfolio Performance', 
      `Investment Profit: ${formatCurrency(investmentProfit, currency, currencyMap)}\n` +
      `Stock Profit: ${formatCurrency(stockProfit, currency, currencyMap)}\n` +
      `Total Profit/Loss: ${formatCurrency(totalProfit, currency, currencyMap)}`
    )
  }

  const fetchStocks = async () => {
    try {
      const response = await fetch(api('/api/stocks'))
      const stocksData = await response.json()
      setStocks(Array.isArray(stocksData) ? stocksData : [])
    } catch (error) {
      console.warn('Failed to fetch stocks:', error)
    }
  }

  const fetchPortfolioSummary = async () => {
    try {
      const response = await fetch(api('/api/stocks/portfolio-summary'))
      const summaryData = await response.json()
      setPortfolioSummary(summaryData)
    } catch (error) {
      console.warn('Failed to fetch portfolio summary:', error)
    }
  }

  const handleAddStock = async () => {
    if (!addStockForm.symbol || !addStockForm.name || !addStockForm.quantity || !addStockForm.purchasePrice) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    try {
      const response = await fetch(api('/api/stocks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: addStockForm.symbol.toUpperCase(),
          name: addStockForm.name,
          quantity: parseFloat(addStockForm.quantity),
          purchasePrice: parseFloat(addStockForm.purchasePrice)
        })
      })
      
      if (response.ok) {
        Alert.alert('Success', 'Stock added successfully')
        setShowAddStockModal(false)
        setAddStockForm({ symbol: '', name: '', quantity: '', purchasePrice: '' })
        fetchStocks()
        fetchPortfolioSummary()
      } else {
        Alert.alert('Error', 'Failed to add stock')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock')
    }
  }

  const handleRemoveStock = async (stockId) => {
    Alert.alert(
      'Remove Stock',
      'Are you sure you want to remove this stock?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(api(`/api/stocks/${stockId}`), {
                method: 'DELETE'
              })
              
              if (response.ok) {
                fetchStocks()
                fetchPortfolioSummary()
              } else {
                Alert.alert('Error', 'Failed to remove stock')
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove stock')
            }
          }
        }
      ]
    )
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchStocks(),
      fetchPortfolioSummary(),
      fetchRecentInvestments()
    ])
    setRefreshing(false)
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

    
    fetchRecentInvestments()
    fetchStocks()
    fetchPortfolioSummary()

    return () => { mounted = false }
  }, [])

  return (
    <>
      <InvestHeader />

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.tintColor} />
        }
      >
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
          <Text style={styles.chartSubtitle}>Last 6 months </Text>
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

        {/* Portfolio Summary */}
        <View style={styles.portfolioSummary}>
          <Text style={styles.sectionTitle}>Stock Portfolio</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>{formatCurrency(portfolioSummary.totalValue, currency, currencyMap)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Profit</Text>
              <Text style={[styles.summaryValue, portfolioSummary.totalProfit >= 0 ? styles.profit : styles.loss]}>
                {portfolioSummary.totalProfit >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalProfit, currency, currencyMap)}
              </Text>
            </View>
          </View>
          <Text style={styles.profitPercentage}>
            {portfolioSummary.profitPercentage >= 0 ? '+' : ''}{portfolioSummary.profitPercentage}% overall return
          </Text>
        </View>

        {/* Stock Holdings */}
        <View style={styles.stockHoldings}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Stocks</Text>
            <TouchableOpacity onPress={() => setShowAddStockModal(true)}>
              <Ionicons name="add-circle" size={24} color={Colors.tintColor} />
            </TouchableOpacity>
          </View>
          {stocks.map((stock) => {
            const isProfit = stock.profit >= 0
            return (
              <View key={stock._id} style={styles.stockCard}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                  <Text style={styles.stockName}>{stock.name}</Text>
                  <Text style={styles.stockDetails}>
                    {stock.quantity} shares @ {formatCurrency(stock.purchasePrice, currency, currencyMap)}
                  </Text>
                </View>
                <View style={styles.stockValues}>
                  <Text style={styles.currentPrice}>{formatCurrency(stock.currentPrice, currency, currencyMap)}</Text>
                  <Text style={[styles.stockProfit, isProfit ? styles.profit : styles.loss]}>
                    {isProfit ? '+' : ''}{formatCurrency(stock.profit, currency, currencyMap)} ({stock.profitPercentage}%)
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveStock(stock._id)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={16} color={Colors.gray} />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
          {stocks.length === 0 && (
            <Text style={styles.emptyText}>No stocks added yet. Tap + to add your first stock!</Text>
          )}
        </View>

        {/* Investment Actions */}
        <View style={styles.investActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAddInvestment}>
            <Text style={styles.actionBtnText}>+ Add Investment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCalculateProfits}>
            <Text style={styles.actionBtnText}>Portfolio Summary</Text>
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
      </ScrollView>

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

      {/* Add Investment Modal */}
      <Modal visible={showAddInvestmentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Investment</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Investment Title"
              placeholderTextColor={Colors.gray}
              value={addInvestmentForm.title}
              onChangeText={(text) => setAddInvestmentForm({...addInvestmentForm, title: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={Colors.gray}
              value={addInvestmentForm.amount}
              onChangeText={(text) => setAddInvestmentForm({...addInvestmentForm, amount: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddInvestmentModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateInvestment}>
                <Text style={styles.createText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Stock Modal */}
      <Modal visible={showAddStockModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Stock Symbol (e.g., AAPL)"
              placeholderTextColor={Colors.gray}
              value={addStockForm.symbol}
              onChangeText={(text) => setAddStockForm({...addStockForm, symbol: text.toUpperCase()})}
              autoCapitalize="characters"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              placeholderTextColor={Colors.gray}
              value={addStockForm.name}
              onChangeText={(text) => setAddStockForm({...addStockForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              placeholderTextColor={Colors.gray}
              value={addStockForm.quantity}
              onChangeText={(text) => setAddStockForm({...addStockForm, quantity: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Purchase Price per Share"
              placeholderTextColor={Colors.gray}
              value={addStockForm.purchasePrice}
              onChangeText={(text) => setAddStockForm({...addStockForm, purchasePrice: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddStockModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleAddStock}>
                <Text style={styles.createText}>Add Stock</Text>
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
  portfolioSummary: {
    backgroundColor: '#0d1417',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  profitPercentage: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  stockHoldings: {
    marginTop: 10,
    marginBottom: 20,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1417',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  stockName: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 2,
  },
  stockDetails: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  stockValues: {
    alignItems: 'flex-end',
    position: 'relative',
  },
  currentPrice: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  stockProfit: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    padding: 4,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
})