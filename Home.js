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
	AppState,
} from "react-native";
import * as Battery from "expo-battery";
import * as Progress from "react-native-progress";
import { startAutoMode, stopAutoMode, callTapoDevice } from "./BackgroundTask";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useDidMountEffect } from "./custom_hooks.js";
import * as SecureStore from "expo-secure-store";

const TASK_NAME = "BATTERY_MONITOR";
TaskManager.defineTask(TASK_NAME, async () => {
	console.log(new Date.getTime());
	check_battery_level();
	return BackgroundFetch.BackgroundFetchResult.NewData;
});

let setPowerStateFn = () => {
	console.log("State not yet initialized");
};

let setAutoModeFn = () => {
	console.log("State not yet initialized");
};

let handle_power_state_fn = () => {
	console.log("State not yet initialized");
};

let setBatteryFn = () => {
	console.log("State not yet initialized");
};

async function check_battery_level() {
	let batteryLevel = await Battery.getBatteryLevelAsync();
	let batteryLevelPercent = batteryLevel * 100;
	let upperLimit = await SecureStore.getItemAsync("upperLimit");
	let lowerLimit = await SecureStore.getItemAsync("lowerLimit");

	if (!(upperLimit && lowerLimit)) {
		Alert.alert("Auto Mode", "Cannot read battery level or limit data.", [
			{
				text: "OK",
				onPress: () => {
					setAutoModeFn(false);
					return;
				},
			},
		]);
		return;
	}

	setBatteryFn(batteryLevel);

	if (batteryLevelPercent >= upperLimit) {
		setPowerStateFn(false);
		handle_power_state_fn(false);
	} else if (batteryLevelPercent <= lowerLimit) {
		setPowerStateFn(true);
		handle_power_state_fn(true);
	}
}

export default function Home() {
	// const [time, setTime] = useState(Date.now());
	const [battery, setBattery] = useState(null);
	setBatteryFn = setBattery;
	const [powerState, setPowerState] = useState(false);
	setPowerStateFn = setPowerState;
	const [autoMode, setAutoMode] = useState(false);
	setAutoModeFn = setAutoMode;

	const [showBanner, setShowBanner] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const [appState, setAppState] = useState(null);

	let batteryLevelInterval = null;

	const onAppStateChange = async (nextAppState) => {
		console.log(
			`onAppStateChange: appState from ${appState} to ${nextAppState}`
		);
		// cold start
		if (appState === null) {
			// do whatever you need on cold start
		}
		// come to foreground from background
		else if (
			appState.match(/inactive|background/) &&
			nextAppState === "active"
		) {
			// do whatever you need on resume
			let battery_level = await Battery.getBatteryLevelAsync();
			setBattery(battery_level);

			if (!batteryLevelInterval) {
				batteryLevelInterval = setInterval(async () => {
					let battery_level = await Battery.getBatteryLevelAsync();
					setBattery(battery_level);
				}, 30 * 1000);
			}
		} else if (
			appState === "active" &&
			nextAppState.match(/inactive|background/)
		) {
			clearInterval(batteryLevelInterval);
		}
		setAppState(nextAppState);
	};

	useEffect(() => {
		AppState.addEventListener("change", onAppStateChange);
		if (appState === null) {
			// The event is not triggered on cold start since the change has already taken place
			// therefore we need to call it manually.
			onAppStateChange(AppState.currentState);
		}
		return () => {
			AppState.removeEventListener("change", onAppStateChange);
		};
	}, [appState]);

	let _subscription = null;

	const _unsubscribe = () => {
		_subscription && _subscription.remove();
		_subscription = null;
	};

	useEffect(async () => {
		let battery_level = await Battery.getBatteryLevelAsync();
		setBattery(battery_level);

		batteryLevelInterval = setInterval(async () => {
			let battery_level = await Battery.getBatteryLevelAsync();
			setBattery(battery_level);
		}, 30 * 1000);

		await update_power_state();

		return () => {
			clearInterval(batteryLevelInterval);
		};
	}, []);

	useDidMountEffect(async () => {
		console.log("auto mode state (handleAutoMode): " + autoMode);
		if (autoMode) {
			await check_battery_level();
			let ret = await startAutoMode(TASK_NAME);
			if (ret == -1) {
				console.log("Cannot start auto mode");
			}
		} else {
			setPowerState(false);
			handle_power_state(false);
			let ret = await stopAutoMode(TASK_NAME);
			if (ret == -1) {
				console.log("Cannot stop auto mode");
			}
		}
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

	handle_power_state_fn = handle_power_state;

	const update_power_state = async () => {
		setRefreshing(true);
		let res;
		try {
			res = await callTapoDevice(null);
			if (res.device_on !== powerState) {
				setPowerState(res.device_on);
			}
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
