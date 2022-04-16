// import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	StyleSheet,
	Text,
	View,
	Button,
	Switch,
	ScrollView,
	RefreshControl,
	Alert,
} from "react-native";
import * as Battery from "expo-battery";
import * as Progress from "react-native-progress";
import { startAutoMode, stopAutoMode, callTapoDevice } from "./BackgroundTask";
import { useDidMountEffect } from "./custom_hooks.js";
import * as SecureStore from "expo-secure-store";

export default function Home() {
	// const [time, setTime] = useState(Date.now());
	const [battery, setBattery] = useState(null);
	const [powerState, setPowerState] = useState(false);
	const [autoMode, setAutoMode] = useState(false);

	const [showBanner, setShowBanner] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	async function check_battery_level() {
		let batteryLevel = await Battery.getBatteryLevelAsync();
		let batteryLevelPercent = batteryLevel * 100;
		let upperLimit = await SecureStore.getItemAsync("upperLimit");
		let lowerLimit = await SecureStore.getItemAsync("lowerLimit");

		if (!(upperLimit && lowerLimit)) {
			Alert.alert("Battery", "Cannot read battery level or limit data.", [
				{
					text: "OK",
					onPress: () => {
						setAutoMode(false);
						return;
					},
				},
			]);
			return;
		}

		setBattery(batteryLevel);

		if (!autoMode) {
			return;
		}

		// auto mode
		if (batteryLevelPercent >= upperLimit) {
			setPowerState(false);
			handle_power_state(false);
		} else if (batteryLevelPercent <= lowerLimit) {
			setPowerState(true);
			handle_power_state(true);
		}
	}

	let battery_interval = null;

	useEffect(async () => {
		await check_battery_level();

		battery_interval = setInterval(async () => {
			await check_battery_level();
		}, 1000 * 60 * 4);

		await update_power_state();

		return () => {
			clearInterval(battery_interval);
		};
	}, []);

	useDidMountEffect(async () => {
		check_battery_level();
	}, [autoMode]);

	const handle_power_state = async (val) => {
		setRefreshing(true);
		let res;
		try {
			console.log(val);
			res = await callTapoDevice(val);
			setPowerState(res.device_on);
			setRefreshing(false);
		} catch (error) {
			Alert.alert(
				"Connection",
				"Could not connect to Tapo device.\nDid you enter correct data?",
				[
					{
						text: "OK",
						onPress: () => {
							setRefreshing(false);
							setPowerState(false);
							return;
						},
					},
					{
						text: "Show Error",
						onPress: () => {
							setRefreshing(false);
							Alert.alert("Error:", error.toString());
							return;
						},
					},
				]
			);
			setRefreshing(false);
		}
	};

	const update_power_state = async () => {
		setRefreshing(true);
		let res;
		try {
			res = await callTapoDevice(null);
			setPowerState(res.device_on);
			setRefreshing(false);
		} catch (error) {
			Alert.alert(
				"Connection",
				"Could not connect to Tapo device.\nDid you enter correct data?",
				[
					{
						text: "OK",
						onPress: () => {
							setRefreshing(false);
							setPowerState(false);
							return;
						},
					},
					{
						text: "Show Error",
						onPress: () => {
							setRefreshing(false);
							Alert.alert("Error:", error.toString());
							return;
						},
					},
				]
			);
			setRefreshing(false);
		}
	};

	const onRefresh = useCallback(async () => {
		await update_power_state();
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<View
				style={{
					height: 50,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: powerState
						? "rgb(52, 199, 89)"
						: "rgb(209, 209, 214)",
				}}
			>
				<Text style={styles.text}>
					{powerState ? "Enabled" : "Disabled"}
				</Text>
			</View>
			<ScrollView
				contentContainerStyle={styles.container}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
			>
				<View
					style={{
						flex: 15,
						paddingVertical: 10,
						paddingHorizontal: 20,
						flexDirection: "column",
					}}
				>
					<View
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Progress.Circle
							progress={battery}
							size={180}
							borderWidth={2}
							thickness={7}
							showsText={true}
							formatText={(progress) => {
								return (progress * 100).toFixed(0) + " %";
							}}
							strokeCap="round"
						/>
					</View>

					<View
						style={{
							flex: 1,
							// justifyContent: "center",
						}}
					>
						<View style={styles.modeSwitch}>
							<Text style={styles.modeText}>Auto Mode</Text>
							<Switch
								onValueChange={(val) => {
									console.log(
										"current auto mode toggle state: " + val
									);
									setAutoMode(val);
								}}
								value={autoMode}
							/>
						</View>

						<View style={styles.modeSwitch}>
							<Text
								style={[
									styles.modeText,
									{ color: autoMode ? "grey" : "black" },
								]}
							>
								Manual Toggle
							</Text>
							<Switch
								disabled={autoMode ? true : false}
								onValueChange={async (val) => {
									console.log("value change: " + val);
									setPowerState(val);
									console.log(
										"after set power state: " + powerState
									);
									await handle_power_state(val);
								}}
								value={powerState}
							/>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = {
	container: {
		flex: 1,
		// flexDirection: "column",
	},
	text: {
		fontSize: 15,
	},
	modeSwitch: {
		height: 50,
		backgroundColor: "rgb(229, 229, 234)",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 10,
		justifyContent: "space-between",
		alignItems: "center",
		marginVertical: 16,
		flexDirection: "row",
	},
	modeText: {
		fontSize: 15,
	},
	banner: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgb(174, 174, 178)",
		marginHorizontal: 10,
		marginTop: 10,
		borderRadius: 20,
		height: 50,
	},
	bannerText: {
		color: "#fff",
		fontSize: 15,
	},
};
