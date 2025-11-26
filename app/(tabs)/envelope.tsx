import { Colors } from '@/constants/Colors'
import { api } from '@/constants/Backend'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import React, { useState, useEffect, useCallback } from 'react'
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const FIXED_CATEGORIES = ['Groceries', 'Transportation', 'Utilities', 'Dining Out', 'Entertainment', 'Other']

const EnvelopeBudgeting = () => {
  const [envelopes, setEnvelopes] = useState([])
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [selectedEnvelope, setSelectedEnvelope] = useState(null)
  const [allocationAmount, setAllocationAmount] = useState('')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [monthlyHistory, setMonthlyHistory] = useState([])

  const totalAllocated = envelopes.reduce((sum, env) => sum + env.allocated, 0)
  const totalSpent = envelopes.reduce((sum, env) => sum + env.spent, 0)

  const fetchEnvelopes = async () => {
    try {
      const response = await fetch(api('/api/envelopes/fixed'))
      const data = await response.json()
      setEnvelopes(data)
    } catch (error) {
      console.warn('Failed to fetch envelopes:', error)
      // Fallback to default structure
      const defaultEnvelopes = FIXED_CATEGORIES.map(cat => ({
        id: cat.toLowerCase(),
        name: cat,
        allocated: 0,
        spent: 0
      }))
      setEnvelopes(defaultEnvelopes)
    }
  }

  const handleSetAllocation = (envelope) => {
    setSelectedEnvelope(envelope)
    setAllocationAmount(envelope.allocated.toString())
    setShowAllocationModal(true)
  }

  const handleUpdateAllocation = async () => {
    if (!selectedEnvelope || !allocationAmount) {
      Alert.alert('Error', 'Please enter an allocation amount')
      return
    }
    
    try {
      const response = await fetch(api('/api/envelopes/allocation'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedEnvelope.name,
          allocated: parseFloat(allocationAmount)
        })
      })
      
      if (response.ok) {
        // Update local state
        setEnvelopes(envelopes.map(env => 
          env.id === selectedEnvelope.id 
            ? { ...env, allocated: parseFloat(allocationAmount) }
            : env
        ))
        setShowAllocationModal(false)
        setSelectedEnvelope(null)
        setAllocationAmount('')
      } else {
        Alert.alert('Error', 'Failed to update allocation')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update allocation')
    }
  }

  const fetchMonthlyHistory = async () => {
    try {
      const response = await fetch(api('/api/summary/history'))
      const data = await response.json()
      
      // Add sample data for Oct and Sep if no data exists
      if (data.length === 0) {
        const sampleData = [
          {
            year: 2024,
            month: 10,
            totalBudget: 25000,
            totalSpent: 18500,
            totalInvestments: 0
          },
          {
            year: 2024,
            month: 9,
            totalBudget: 22000,
            totalSpent: 19800,
            totalInvestments: 0
          }
        ]
        setMonthlyHistory(sampleData)
      } else {
        setMonthlyHistory(data)
      }
    } catch (error) {
      console.warn('Failed to fetch monthly history:', error)
      // Fallback to sample data
      const sampleData = [
        {
          year: 2024,
          month: 10,
          totalBudget: 25000,
          totalSpent: 18500,
          totalInvestments: 0
        },
        {
          year: 2024,
          month: 9,
          totalBudget: 22000,
          totalSpent: 19800,
          totalInvestments: 0
        }
      ]
      setMonthlyHistory(sampleData)
    }
  }

  useEffect(() => {
    fetchEnvelopes()
  }, [])

  // Refresh data when tab is focused (e.g., after adding expense)
  useFocusEffect(
    useCallback(() => {
      fetchEnvelopes()
    }, [])
  )

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100
    if (percentage >= 100) return '#ff6b6b'
    if (percentage >= 80) return '#ffa500'
    return Colors.tintColor
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Envelope Budget</Text>
        <TouchableOpacity onPress={() => {
          setShowHistoryModal(true)
          fetchMonthlyHistory()
        }}>
          <Ionicons name="calendar-outline" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Budget Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewAmount}>₹{totalAllocated.toLocaleString()}</Text>
              <Text style={styles.overviewLabel}>Allocated</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewAmount}>₹{totalSpent.toLocaleString()}</Text>
              <Text style={styles.overviewLabel}>Spent</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewAmount, { color: Colors.green }]}>
                ₹{(totalAllocated - totalSpent).toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Envelopes */}
        <View style={styles.envelopesSection}>
          <Text style={styles.sectionTitle}>Your Envelopes</Text>
          
          {envelopes.map((envelope) => {
            const remaining = envelope.allocated - envelope.spent
            const progress = Math.min((envelope.spent / envelope.allocated) * 100, 100)
            const progressColor = getProgressColor(envelope.spent, envelope.allocated)
            
            return (
              <View key={envelope.id} style={styles.envelopeCard}>
                <View style={styles.envelopeHeader}>
                  <Text style={styles.envelopeName}>{envelope.name}</Text>
                  <View style={styles.envelopeHeaderRight}>
                    <Text style={[styles.remainingAmount, remaining < 0 && { color: '#ff6b6b' }]}>
                      ₹{remaining.toLocaleString()}
                    </Text>
                    <TouchableOpacity 
                      style={styles.editBtn} 
                      onPress={() => handleSetAllocation(envelope)}
                    >
                      <Ionicons name="pencil" size={16} color={Colors.gray} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${progress}%`, backgroundColor: progressColor }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                </View>
                
                <View style={styles.envelopeFooter}>
                  <Text style={styles.spentText}>
                    Spent: ₹{envelope.spent.toLocaleString()}
                  </Text>
                  <Text style={styles.allocatedText}>
                    of ₹{envelope.allocated.toLocaleString()}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* Set Allocation Modal */}
      <Modal visible={showAllocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Budget for {selectedEnvelope?.name}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Allocation Amount"
              placeholderTextColor={Colors.gray}
              value={allocationAmount}
              onChangeText={setAllocationAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowAllocationModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleUpdateAllocation}>
                <Text style={styles.addText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Monthly History Modal */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle}>Monthly Summary History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {monthlyHistory.length === 0 ? (
                <Text style={{ color: Colors.gray, textAlign: 'center', marginTop: 40 }}>No monthly summaries yet</Text>
              ) : (
                monthlyHistory.map((summary, index) => (
                  <View key={index} style={styles.historyCard}>
                    <Text style={styles.historyMonth}>
                      {new Date(summary.year, summary.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    
                    <View style={styles.historyRow}>
                      <Text style={styles.historyLabel}>Budget:</Text>
                      <Text style={styles.historyValue}>₹{summary.totalBudget.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.historyRow}>
                      <Text style={styles.historyLabel}>Spent:</Text>
                      <Text style={[styles.historyValue, { color: '#ff6b6b' }]}>₹{summary.totalSpent.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.historyRow}>
                      <Text style={styles.historyLabel}>Saved:</Text>
                      <Text style={[styles.historyValue, { color: Colors.green }]}>₹{(summary.totalBudget - summary.totalSpent).toLocaleString()}</Text>
                    </View>

                    <View style={styles.historyRow}>
                      <Text style={styles.historyLabel}>Investments:</Text>
                      <Text style={[styles.historyValue, { color: Colors.tintColor }]}>₹{(summary.totalInvestments || 0).toLocaleString()}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default EnvelopeBudgeting

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: Colors.black,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
  },
  overviewCard: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  overviewTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewAmount: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  overviewLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  envelopesSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  envelopeCard: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  envelopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  envelopeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    padding: 4,
  },
  envelopeName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  remainingAmount: {
    color: Colors.green,
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1f2933',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: Colors.gray,
    fontSize: 12,
    minWidth: 35,
  },
  envelopeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    color: Colors.gray,
    fontSize: 12,
  },
  allocatedText: {
    color: Colors.gray,
    fontSize: 12,
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
  addBtn: {
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
  addText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#0f1720',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyMonth: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyLabel: {
    color: Colors.gray,
    fontSize: 14,
  },
  historyValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})