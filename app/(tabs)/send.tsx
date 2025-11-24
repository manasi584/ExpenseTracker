import SendHeader from '@/components/SendHeader'
import Hr from '@/components/ui/Hr'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { api } from '@/constants/Backend'
import { useRouter } from 'expo-router'

const contacts = [
  { id: 'c1', name: 'Contact 1', avatar: require('@/assets/svgs/r.svg') },
  { id: 'c2', name: 'Contact 2', avatar: require('@/assets/svgs/t.svg') },
  { id: 'c3', name: 'Contact 3', avatar: require('@/assets/svgs/s.svg') },
  { id: 'c4', name: 'Contact 4', avatar: require('@/assets/svgs/k.svg') },
  { id: 'c5', name: 'Contact 5', avatar: require('@/assets/svgs/o.svg') },
]

const FIXED_CATEGORIES = ['Groceries', 'Transportation', 'Utilities', 'Dining Out', 'Entertainment', 'Other']

const Send = () => {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('Other')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSelect = (id: string) => {
    setSelected(id)
  }

  const handleSend = () => {
    if (!selected) {
      Alert.alert('Select contact', 'Please select a contact to send money to.')
      return
    }
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.')
      return
    }
    const contact = contacts.find(c => c.id === selected)!
    Alert.alert(
      'Confirm Send',
      `Send ₹${parsed.toLocaleString()} to ${contact.name}?${note ? '\n\nNote: ' + note : ''}`,
      [{ text: 'Cancel' }, { text: 'Send', onPress: sendMoney }]
    )
  }

  const sendMoney = async () => {
    try {
      const contact = contacts.find(c => c.id === selected)!
      const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''))
      
      const response = await fetch(api('/api/expenses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Sent to ${contact.name}`,
          amount: -parsed,
          category: category,
          description: note || undefined
        })
      })
      
      if (response.ok) {
        setShowSuccess(true)
      } else {
        Alert.alert('Error', 'Failed to send money. Please try again.')
      }
    } catch (err) {
      console.warn('Failed to send money', err)
      Alert.alert('Error', 'Failed to send money. Please try again.')
    }
  }

  return (
    <>
      <SendHeader />
      <Hr />

      <ScrollView style={{ marginBottom: 10 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Choose a contact</Text>

          <View style={styles.contactsGrid}>
            {contacts.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.contactItem, selected === c.id && styles.contactSelected]}
                onPress={() => handleSelect(c.id)}
              >
                <Image source={c.avatar} style={styles.contactAvatar} />
                <Text style={styles.contactName}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.selectedPreview}>
            {selected ? (
              <>
                <Text style={styles.previewLabel}>Sending to</Text>
                <View style={styles.previewRow}>
                  <Image source={contacts.find(c => c.id === selected)!.avatar} style={styles.previewAvatar} />
                  <Text style={styles.previewName}>{contacts.find(c => c.id === selected)!.name}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.previewPlaceholder}>Select a contact above to start</Text>
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={Colors.gray}
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {FIXED_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, category === cat && styles.categorySelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Note (optional)</Text>
            <TextInput
              placeholder="e.g. dinner, taxi"
              placeholderTextColor={Colors.gray}
              value={note}
              onChangeText={setNote}
              style={[styles.input, styles.noteInput]}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={18} color={Colors.white} />
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* Sent success full-screen overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={72} color={Colors.tintColor} />
            <Text style={styles.successTitle}>Sent Successfully</Text>
            <Text style={styles.successDetail}>
              {amount ? `₹${parseFloat(amount.replace(/[^0-9.]/g, '')).toLocaleString()}` : ''} {selected ? `to ${contacts.find(c => c.id === selected)!.name}` : ''}
            </Text>
            {note ? <Text style={styles.successNote}>Note: {note}</Text> : null}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                // dismiss and reset
                setShowSuccess(false)
                setAmount('')
                setNote('')
                setSelected(null)
                setCategory('Other')
                // Navigate to index to refresh recent activity
                router.push('/(tabs)/')
              }}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  )
}

export default Send

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  contactsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    width: 70,
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    padding: 6,
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 12,
  },
  contactName: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  contactSelected: {
    borderWidth: 1,
    borderColor: Colors.tintColor,
    borderRadius: 8,
    padding: 4,
  },
  selectedPreview: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#0f1720',
    borderRadius: 10,
    minHeight: 70,
    justifyContent: 'center',
  },
  previewLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  previewAvatar: {
    width: 50,
    height: 50,
  },
  previewName: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '700',
  },
  previewPlaceholder: {
    color: Colors.gray,
    fontSize: 14,
  },
  form: {
    marginTop: 16,
  },
  inputLabel: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0b1114',
    color: Colors.white,
    padding: 12,
    borderRadius: 8,
  },
  noteInput: {
    height: 48,
  },
  sendBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tintColor,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendText: {
    color: Colors.white,
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successCard: {
    width: '84%',
    backgroundColor: '#071014',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  successTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  successDetail: {
    color: Colors.gray,
    marginTop: 8,
  },
  successNote: {
    color: Colors.gray,
    marginTop: 8,
    fontStyle: 'italic',
  },
  doneBtn: {
    marginTop: 18,
    backgroundColor: Colors.tintColor,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  doneText: {
    color: Colors.white,
    fontWeight: '700',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryBtn: {
    backgroundColor: '#0b1114',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categorySelected: {
    backgroundColor: Colors.tintColor,
    borderColor: Colors.tintColor,
  },
  categoryText: {
    color: Colors.gray,
    fontSize: 12,
  },
  categoryTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
})