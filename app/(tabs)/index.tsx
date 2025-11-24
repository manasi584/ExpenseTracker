import AuthHeader from '@/components/AuthHeader'
import Header from '@/components/Header'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/hooks/useAuth'
import { Image } from 'expo-image'
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BACKEND_BASE, api } from '@/constants/Backend'

const currencies = {
  INR: { label: 'Indian Rupee', symbol: '₹', flag: require('@/assets/svgs/indian.svg') },
  USD: { label: 'US Dollar', symbol: '$', flag: require('@/assets/svgs/us.svg') },
  CNY: { label: 'Chinese Yuan', symbol: '¥', flag: require('@/assets/svgs/china.svg') },
}



// add this missing sampleInvestments constant
const sampleInvestments = [
  { id: 'inv1', name: 'Index Fund', value: 8000 },
  { id: 'inv2', name: 'High Yield', value: 12000 },
]

// Exchange rates (static) — base currency is INR
const exchangeRates: Record<string, number> = {
  INR: 1,
  USD: 0.012, // 1 INR -> 0.012 USD (example)
  CNY: 0.085, // 1 INR -> 0.085 CNY (example)
}

// Convert from INR -> target currency
const convert = (amountInINR: number, target: keyof typeof currencies) => {
  const rate = exchangeRates[target] ?? 1
  return amountInINR * rate
}

// Convert from target currency -> INR (for sending to backend)
const toBase = (amountInTarget: number, target: keyof typeof currencies) => {
  const rate = exchangeRates[target] ?? 1
  // avoid divide by zero
  return rate ? amountInTarget / rate : amountInTarget
}

const formatCurrency = (amountInINR: number, target: keyof typeof currencies) => {
  const v = convert(amountInINR, target)
  const opts: Intl.NumberFormatOptions = Math.abs(v) < 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }
  return `${currencies[target].symbol}${v.toLocaleString(undefined, opts)}`
}

const HomeScreen = () => {
  const [currency, setCurrency] = useState<'INR'|'USD'|'CNY'>('INR')
  const { user, loading } = useAuth();
  const [expenses, setExpenses] = useState([])
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [fetching, setFetching] = useState(true)
  const [budget, setBudget] = useState(0)
  const [spent, setSpent] = useState(0)
  const [settingBudget, setSettingBudget] = useState(false)
  const [newBudget, setNewBudget] = useState('')
  const [cardsOwned, setCardsOwned] = useState(0)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [monthEndSummary, setMonthEndSummary] = useState(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const categories = ['Groceries', 'Transportation', 'Utilities', 'Dining Out', 'Entertainment', 'Other']

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.black }}>
        <ActivityIndicator size="large" color={Colors.tintColor} />
      </View>
    );
  }

  if (!user) {
    return <AuthHeader />;
  }



  const symbol = currencies[currency].symbol
  const remaining = budget - spent
  const progress = Math.min(1, spent / budget)
  const investmentsTotal = sampleInvestments.reduce((s, i) => s + i.value, 0)
  const netBalance = budget - spent + investmentsTotal

 
  const handleAddExpense = () => {
    const parsed = Number(amount)
    if (!title.trim() || !category.trim() || !amount.trim() || Number.isNaN(parsed)) {
      Alert.alert('Invalid input', 'Please provide title, category and a numeric amount.')
      return
    }
    // convert user-entered amount (in selected currency) to base INR before sending
    const amountInINR = toBase(parsed, currency)
    // POST to backend
    fetch(api('/api/expenses'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), category: category.trim(), amount: amountInINR })
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to create expense')
        }
        return res.json()
      })
      .then((created) => {
        // prepend server-created expense
        setExpenses((s) => [created, ...s])
        // refresh budget data to get accurate spent calculation
        if (amountInINR > 0) {
          fetch(api('/api/budget'))
            .then(r => r.json())
            .then(budgetData => {
              if (budgetData) setSpent(budgetData.spent)
            })
            .catch(() => {})
        }
        setTitle('')
        setCategory('')
        setAmount('')
        setAdding(false)
      })
      .catch((err) => {
        console.warn('Add expense failed', err)
        Alert.alert('Save failed', err.message || 'Could not save expense.')
        setTitle('')
        setCategory('')
        setAmount('')
        setAdding(false)
      })
  }

  const handleSetBudget = () => {
    const parsed = Number(newBudget)
    if (!newBudget.trim() || Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid input', 'Please provide a valid budget amount.')
      return
    }
    const budgetInINR = toBase(parsed, currency)
    fetch(api('/api/budget'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: budgetInINR })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to update budget')
        return res.json()
      })
      .then((updated) => {
        setBudget(updated.budget)
        setNewBudget('')
        setSettingBudget(false)
      })
      .catch((err) => {
        Alert.alert('Update failed', 'Could not update budget')
      })
  }

  // helper to format time returned from server or keep local strings
  const formatTime = (t: any) => {
    if (!t) return ''
    const d = new Date(t)
    if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return String(t)
  }

  const checkMonthEndSummary = async () => {
    try {
      const response = await fetch(api('/api/summary/current'))
      const data = await response.json()
      if (data.isMonthEnd) {
        setMonthEndSummary(data)
        setShowSummaryModal(true)
      }
    } catch (error) {
      console.warn('Failed to check month-end summary:', error)
    }
  }

  const handleSaveSummary = async () => {
    if (!monthEndSummary) return
    
    try {
      await fetch(api('/api/summary/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monthEndSummary)
      })
      setShowSummaryModal(false)
      setMonthEndSummary(null)
      // Refresh data after reset
      window.location.reload()
    } catch (error) {
      console.warn('Failed to save summary:', error)
    }
  }

  // fetch expenses and budget from backend on mount
  useEffect(() => {
    let mounted = true
    
    const timeout = setTimeout(() => {
      if (mounted) setFetching(false)
    }, 5000) // 5 second timeout
    
    Promise.all([
      fetch(api('/api/expenses')).then(r => r.json()),
      fetch(api('/api/budget')).then(r => r.json()),
      fetch(api('/api/user')).then(r => r.json())
    ])
      .then(([expensesList, budgetData, userData]) => {
        if (!mounted) return
        console.log('Expenses loaded:', expensesList)
        if (Array.isArray(expensesList)) setExpenses(expensesList)
        if (budgetData) {
          setBudget(budgetData.budget)
          setSpent(budgetData.spent)
        }
        if (userData) {
          setCardsOwned(userData.cards)
        }
        // Check for month-end summary after loading data
        checkMonthEndSummary()
      })
      .catch((err) => {
        console.warn('Failed to load data', err)
      })
      .finally(() => {
        if (mounted) {
          clearTimeout(timeout)
          setFetching(false)
        }
      })
    return () => { 
      mounted = false
      clearTimeout(timeout)
    }
  }, [])

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
              {(Object.keys(currencies) as (keyof typeof currencies)[]).map((k) => (
                <TouchableOpacity key={k} onPress={() => setCurrency(k)} style={{ padding: 6 }}>
                  <Image source={currencies[k].flag} style={{ width: 24, height: 24, opacity: currency === k ? 1 : 0.45 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Overview: cards / investments / balance */}
          <View style={styles.overview}>
            <View style={styles.overviewItem}>
              <Image source={require('@/assets/svgs/scards.svg')} style={styles.overviewIcon} contentFit="contain" />
              {fetching ? (
                <ActivityIndicator size="small" color={Colors.tintColor} />
              ) : (
                <Text style={styles.overviewValue}>{cardsOwned}</Text>
              )}
              <Text style={styles.overviewLabel}>Cards</Text>
            </View>

            <View style={styles.overviewItem}>
              <Image source={require('@/assets/svgs/chart.svg')} style={styles.overviewIcon} contentFit="contain" />
              <Text style={styles.overviewValue}>{formatCurrency(investmentsTotal, currency)}</Text>
              <Text style={styles.overviewLabel}>Investments</Text>
            </View>

            <View style={styles.overviewItem}>
              <Image source={require('@/assets/svgs/str.svg')} style={styles.overviewIcon} contentFit="contain" />
              <Text style={styles.overviewValue}>{formatCurrency(netBalance, currency)}</Text>
              <Text style={styles.overviewLabel}>Net Balance</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Monthly Budget</Text>

            <View style={styles.amountRow}>
              {fetching ? (
                <ActivityIndicator size="large" color={Colors.tintColor} />
              ) : (
                <Text style={styles.amountLarge}>{formatCurrency(budget, currency)}</Text>
              )}
              <View style={styles.smallAmounts}>
                {fetching ? (
                  <ActivityIndicator size="small" color={Colors.tintColor} />
                ) : (
                  <>
                    <Text style={styles.spent}>Spent: {formatCurrency(spent, currency)}</Text>
                    <Text style={styles.remaining}>Remaining: {formatCurrency(remaining, currency)}</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setAdding(true)}>
                <Text style={styles.actionText}>Add Expense</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.ghostBtn]} onPress={() => setSettingBudget(true)}>
                <Text style={styles.actionText}>Set Budget</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            {fetching ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={Colors.tintColor} />
                <Text style={{ color: Colors.gray, marginTop: 8 }}>Loading expenses...</Text>
              </View>
            ) : expenses.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: Colors.gray, fontSize: 16 }}>No expenses yet</Text>
                <Text style={{ color: Colors.gray, fontSize: 14, marginTop: 4 }}>Add your first expense to get started</Text>
              </View>
            ) : (
              expenses.map((item, index) => {
                const isIncome = item.amount < 0;
                return (
                  <View key={item._id || item.id || index} style={styles.expenseRow}>
                    <Image source={require('@/assets/svgs/wallet.svg')} style={styles.expenseIcon} />
                    <View style={styles.expenseText}>
                      <Text style={styles.expenseTitle}>{item.title}</Text>
                      <Text style={styles.expenseDetail}>{item.category} • {formatTime(item.time)}</Text>
                    </View>
                    <Text style={[styles.expenseAmount, isIncome ? styles.income : styles.outcome]}>
                      {isIncome ? '+' : ''}{formatCurrency(Math.abs(item.amount), currency)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Add Expense Modal */}
          <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
              <View style={styles.modalContainer}>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Add Expense</Text>
                <TextInput placeholder="Title" placeholderTextColor="#9AA0A4" style={styles.input} value={title} onChangeText={setTitle} />
                
                <TouchableOpacity 
                  style={[styles.input, styles.dropdownInput]} 
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <Text style={[styles.dropdownText, !category && styles.placeholderText]}>
                    {category || 'Select Category'}
                  </Text>
                  <Ionicons name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.gray} />
                </TouchableOpacity>
                
                {showCategoryDropdown && (
                  <View style={styles.dropdown}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCategory(cat)
                          setShowCategoryDropdown(false)
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <TextInput placeholder="Amount" placeholderTextColor="#9AA0A4" style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#243038' }]} onPress={() => setAdding(false)}>
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.tintColor }]} onPress={handleAddExpense}>
                    <Text style={styles.modalBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Set Budget Modal */}
          <Modal visible={settingBudget} transparent animationType="fade" onRequestClose={() => setSettingBudget(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
              <View style={styles.modalContainer}>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Set Budget</Text>
                <TextInput placeholder="Budget Amount" placeholderTextColor="#9AA0A4" style={styles.input} value={newBudget} onChangeText={setNewBudget} keyboardType="numeric" />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#243038' }]} onPress={() => setSettingBudget(false)}>
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.tintColor }]} onPress={handleSetBudget}>
                    <Text style={styles.modalBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Month-End Summary Modal */}
          <Modal visible={showSummaryModal} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalContainer, { maxHeight: '80%' }]}>
                <Text style={[styles.sectionTitle, { marginBottom: 16, textAlign: 'center' }]}>Month-End Summary</Text>
                
                {monthEndSummary && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 16 }}>
                      <Text style={styles.summaryMonth}>
                        {new Date(monthEndSummary.year, monthEndSummary.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Budget:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(monthEndSummary.totalBudget, currency)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Spent:</Text>
                      <Text style={[styles.summaryValue, { color: '#ff6b6b' }]}>{formatCurrency(monthEndSummary.totalSpent, currency)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Income:</Text>
                      <Text style={[styles.summaryValue, { color: Colors.green }]}>{formatCurrency(monthEndSummary.totalIncome, currency)}</Text>
                    </View>
                    
                    <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 16, marginBottom: 8 }]}>Category Breakdown</Text>
                    
                    {monthEndSummary.categoryBreakdown.map((cat, index) => (
                      <View key={index} style={styles.categoryRow}>
                        <Text style={styles.categoryName}>{cat.category}</Text>
                        <View style={styles.categoryAmounts}>
                          <Text style={styles.categorySpent}>{formatCurrency(cat.spent, currency)}</Text>
                          <Text style={styles.categoryAllocated}>/ {formatCurrency(cat.allocated, currency)}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.tintColor }]} onPress={handleSaveSummary}>
                    <Text style={styles.modalBtnText}>Save & Reset for New Month</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    backgroundColor: '#081118',
    color: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: Colors.white,
    flex: 1,
  },
  placeholderText: {
    color: '#9AA0A4',
  },
  dropdown: {
    backgroundColor: '#081118',
    borderRadius: 8,
    marginBottom: 10,
    marginTop: -10,
    borderWidth: 1,
    borderColor: '#243038',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#243038',
  },
  dropdownItemText: {
    color: Colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 6,
  },
  modalBtnText: {
    color: Colors.white,
    fontWeight: '700',
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
    padding: 22,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
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

  overview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  overviewItem: {
    flex: 1,
    backgroundColor: '#0f1720',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  overviewIcon: {
    width: 28,
    height: 28,
    marginBottom: 6,
    tintColor: Colors.white,
  },
  overviewValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  overviewLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 6,
  },
  summaryMonth: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.gray,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#243038',
  },
  categoryName: {
    color: Colors.white,
    fontSize: 13,
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySpent: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryAllocated: {
    color: Colors.gray,
    fontSize: 13,
  },
})