import { UserHeader } from '@/components/Header'
import MoreHeader from '@/components/MoreHeader'
import Hr from '@/components/ui/Hr'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/hooks/useAuth'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { api } from '@/constants/Backend'

const Page = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/auth/login') }
      ]
    );
  };

  const handleAccountDetails = () => {
    if (userProfile) {
      Alert.alert(
        'Account Details',
        `Name: ${userProfile.name}\nEmail: ${userProfile.email}\nCards: ${userProfile.cards}\nBudget: ₹${userProfile.budget.toLocaleString()}`,
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    fetch(api('/api/user'))
      .then(r => r.json())
      .then(userData => setUserProfile(userData))
      .catch(() => {});
  }, []);

  return (
    <>
      <MoreHeader />
      <ScrollView style={[styles.container, {marginBottom: 20}]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={handleAccountDetails}>
          <UserHeader />
        </TouchableOpacity>
        <Hr />

        <View style={styles.content}>
          {/* reusable menu row */}
          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/logo.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Upgrade to Benefits Card Plus</Text>
                <Text style={styles.itemSubtitle}>Get premium perks for budgeting and cashback.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/str.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Reports & Insights</Text>
                <Text style={styles.itemSubtitle}>View spending reports and export summaries</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/scards.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Categories</Text>
                <Text style={styles.itemSubtitle}>Manage spending categories and rules</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/help.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Export Data</Text>
                <Text style={styles.itemSubtitle}>Download CSV of transactions and reports</Text>
              </View>
            </View>
            <Ionicons name="download" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/security.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Security</Text>
                <Text style={styles.itemSubtitle}>Two-factor, passcode and account protection</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/refs.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Referrals & Rewards</Text>
                <Text style={styles.itemSubtitle}>Earn rewards for inviting friends and using the Benefits Card</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/limit.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Account Limits</Text>
                <Text style={styles.itemSubtitle}>How much you can spend and receive</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/legal.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>About & Legal</Text>
                <Text style={styles.itemSubtitle}>Terms, privacy and our agreements with you</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.white} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
            <View style={styles.itemLeft}>
              <Ionicons name="log-out-outline" size={24} color="#ff4444" style={styles.logoutIcon} />
              <View style={styles.itemBody}>
                <Text style={[styles.itemTitle, styles.logoutText]}>Logout</Text>
                <Text style={styles.itemSubtitle}>Sign out of your account</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  )
}

export default Page

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F12', // dark background for dark mode
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2933', // subtle divider on dark bg
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#111418', // darker icon background
    padding: 8,
    marginRight: 12,
    contentFit: 'contain',
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    color: Colors.white, // light text for dark mode
    fontSize: 16,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#9AA0A4', // muted light subtitle for dark bg
    fontSize: 13,
    marginTop: 4,
  },
  chevron: {
    marginLeft: 12,
  },
  logoutRow: {
    borderBottomWidth: 0,
    marginTop: 20,
  },
  logoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#111418',
    padding: 12,
    marginRight: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  logoutText: {
    color: '#ff4444',
  },
})