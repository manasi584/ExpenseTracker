import { UserHeader } from '@/components/Header'
import MoreHeader from '@/components/MoreHeader'
import Hr from '@/components/ui/Hr'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Page = () => {
  return (
    <>
      <MoreHeader />
      <ScrollView style={{marginBottom: 20}} showsVerticalScrollIndicator={false}>
        <UserHeader />
        <Hr />

        <View style={styles.content}>
          {/* reusable menu row */}
          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/images/icon.png')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Upgrade to Benefits Card Plus</Text>
                <Text style={styles.itemSubtitle}>Get premium perks for budgeting and cashback.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/str.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Reports & Insights</Text>
                <Text style={styles.itemSubtitle}>View spending reports and export summaries</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/scards.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Categories</Text>
                <Text style={styles.itemSubtitle}>Manage spending categories and rules</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/help.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Export Data</Text>
                <Text style={styles.itemSubtitle}>Download CSV of transactions and reports</Text>
              </View>
            </View>
            <Ionicons name="download" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/security.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Security</Text>
                <Text style={styles.itemSubtitle}>Two-factor, passcode and account protection</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/refs.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Referrals & Rewards</Text>
                <Text style={styles.itemSubtitle}>Earn rewards for inviting friends and using the Benefits Card</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/limit.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>Account Limits</Text>
                <Text style={styles.itemSubtitle}>How much you can spend and receive</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.itemLeft}>
              <Image source={require('@/assets/svgs/legal.svg')} style={styles.itemIcon} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>About & Legal</Text>
                <Text style={styles.itemSubtitle}>Terms, privacy and our agreements with you</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.black} style={styles.chevron} />
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
    backgroundColor: Colors.white, // light background so text can be dark
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
    borderBottomColor: '#071012',
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
    backgroundColor: '#F2F4F6',
    padding: 8,
    marginRight: 12,
    resizeMode: 'contain',
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    color: Colors.black, // dark text
    fontSize: 16,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#4A4A4A', // darker subtitle
    fontSize: 13,
    marginTop: 4,
  },
  chevron: {
    marginLeft: 12,
  },
})