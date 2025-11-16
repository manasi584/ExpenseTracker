import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.wrapper}
      >
        <View style={styles.userInfoWrapper}>
          <Image
            source={require('@/assets/images/images.jpeg')}
            style={styles.userImg}
          />
          <View style={styles.userTxtWrapper}>
            <Text style={[styles.userText, { fontSize: 12 }]}>Hi, username1</Text>
            <Text style={[styles.userText, { fontSize: 16 }]}>
              Your <Text style={styles.boldText}>Budget</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { }}
          style={styles.btnWrapper}
        >
          <Text style={styles.btnText}>
            My Transactions
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;


export const UserHeader = () => {
  return (
    <SafeAreaView style={{ marginTop: -30 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          height: 70,
          alignItems: "center",
        }}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Image
            source={require('@/assets/images/images.jpeg')}
            style={{
              height: 70,
              width: 70,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: Colors.tintColor,
            }}
          />
          <View style={styles.userTxtWrapper}>
            <Text style={[styles.userText, { fontSize: 18, fontWeight: "bold" }]}>John Doe (username1)</Text>
            <Text style={[styles.userText, { fontSize: 15, color: Colors.gray }]}>
              Account Details
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { }}
          style={{
            borderColor: "#666",
            borderWidth: 1,
            padding: 6,
            borderRadius: 50,
          }}
        >
          <Ionicons name="chevron-forward" size={24} color={Colors.white} style={{
            color: Colors.white,
            fontWeight: 'bold',
            fontSize: 26,
            textAlign: 'center',
          }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: -20,
  },
  userImg: {
    height: 50,
    width: 50,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.tintColor,
  },
  userTxtWrapper: {
    marginLeft: 10,
  },
  userText: {
    color: Colors.white,
  },
  boldText: {
    fontWeight: '700',
  },
  btnWrapper: {
    borderColor: "#666",
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
  },
  btnText: {
    color: Colors.white,
    fontSize: 12,
  },
});
