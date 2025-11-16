import CardHeader from "@/components/CardHeader";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const perks = [
	{
		id: "p1",
		title: "Instant Virtual Card",
		desc: "Create a virtual card instantly for safe online payments.",
	},
	{
		id: "p2",
		title: "Auto Expense Categorization",
		desc: "Card spends are auto-categorized to keep your budget organized.",
	},
	{
		id: "p3",
		title: "Cashback & Rewards",
		desc: "Earn cashback on bills and select merchants.",
	},
	{
		id: "p4",
		title: "Round-ups to Savings",
		desc: "Round-up transactions to grow your savings automatically.",
	},
];

const Page = () => {
	const handleGetCard = () => {
		// placeholder - hook this to real request flow
		Alert.alert(
			"Card Requested",
			"Thank you — we will process your Benefits Card request and notify you."
		);
	};

	const handleLearnMore = () => {
		Alert.alert(
			"Learn More",
			"This will open a detailed page about Benefits Card features (placeholder)."
		);
	};

	return (
		<>
			<CardHeader />
			<View style={styles.container}>
				<View style={styles.promoCard}>
					<Image
						source={require("@/assets/svgs/visa.svg")}
						style={styles.cardImage}
					/>
					<Text style={styles.headline}>Get your Benefits Card</Text>
					<Text style={styles.subtitle}>
						Spend smarter — get exclusive budgeting features, cashback and
						enhanced control over your expenses.
					</Text>

					<View style={styles.ctaRow}>
						<TouchableOpacity
							style={styles.primaryBtn}
							onPress={handleGetCard}
						>
							<Ionicons name="card" size={18} color={Colors.white} />
							<Text style={styles.primaryText}>Get Card</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.ghostBtn}
							onPress={handleLearnMore}
						>
							<Text style={styles.ghostText}>Learn More</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.perksSection}>
					<Text style={styles.sectionTitle}>Exclusive Benefits</Text>
					{perks.map((p) => (
						<View key={p.id} style={styles.perkRow}>
							<View style={styles.perkIcon}>
								<Ionicons
									name="checkmark"
									size={18}
									color={Colors.tintColor}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.perkTitle}>{p.title}</Text>
								<Text style={styles.perkDesc}>{p.desc}</Text>
							</View>
						</View>
					))}
				</View>

				<View style={styles.footerNote}>
					<Text style={styles.footerText}>
						Physical card delivery and verification may require identity
						confirmation. Virtual card available instantly.
					</Text>
				</View>
			</View>
		</>
	);
};

export default Page;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.black,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	promoCard: {
		backgroundColor: "#0f1720",
		borderRadius: 12,
		padding: 18,
		alignItems: "center",
	},
	cardImage: {
		width: 220,
		height: 120,
		marginBottom: 8,
	},
	headline: {
		color: Colors.white,
		fontSize: 22,
		fontWeight: "700",
		marginTop: 8,
		textAlign: "center",
	},
	subtitle: {
		color: Colors.gray,
		fontSize: 14,
		textAlign: "center",
		marginTop: 8,
	},
	ctaRow: {
		flexDirection: "row",
		marginTop: 16,
		width: "100%",
		justifyContent: "space-between",
		gap: 12,
	},
	primaryBtn: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: Colors.tintColor,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryText: {
		color: Colors.white,
		marginLeft: 8,
		fontWeight: "700",
	},
	ghostBtn: {
		marginLeft: 12,
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: Colors.gray,
		justifyContent: "center",
		alignItems: "center",
	},
	ghostText: {
		color: Colors.white,
		fontWeight: "700",
	},

	perksSection: {
		marginTop: 20,
	},
	sectionTitle: {
		color: Colors.white,
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 12,
	},
	perkRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#071012",
	},
	perkIcon: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: "#081216",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	perkTitle: {
		color: Colors.white,
		fontSize: 15,
		fontWeight: "700",
	},
	perkDesc: {
		color: Colors.gray,
		fontSize: 13,
		marginTop: 4,
	},

	footerNote: {
		marginTop: 20,
		padding: 12,
		backgroundColor: "#071014",
		borderRadius: 8,
	},
	footerText: {
		color: Colors.gray,
		fontSize: 13,
		textAlign: "center",
	},
});
