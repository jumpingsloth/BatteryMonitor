// import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, Switch } from "react-native";
import * as Battery from "expo-battery";
import * as Progress from "react-native-progress";
import { startAutoMode, stopAutoMode, callTapoDevice } from "./BackgroundTask";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useDidMountEffect } from "./custom_hooks.js";

const TASK_NAME = "BATTERY_MONITOR";
TaskManager.defineTask(TASK_NAME, async () => {
	alert("test");
	return BackgroundFetch.BackgroundFetchResult.NewData;
});

export default function Home() {
	// const [time, setTime] = useState(Date.now());
	const [battery, setBattery] = useState(null);
	const [powerState, setPowerState] = useState(false);
	const [autoMode, setAutoMode] = useState(false);

	let _subscription = null;

	const _subscribe = async () => {
		const batteryLevel = await Battery.getBatteryLevelAsync();
		setBattery(batteryLevel);
		_subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
			setBattery(batteryLevel);
			console.log("batteryLevel changed!", batteryLevel);
		});
	};

	const _unsubscribe = () => {
		_subscription && _subscription.remove();
		_subscription = null;
	};

	useEffect(async () => {
		await _subscribe();
		const tapo_state = await callTapoDevice();
		setPowerState(tapo_state.device_on);

		return () => {
			_unsubscribe();
		};
	}, []);

	useDidMountEffect(async () => {
		console.log("auto mode state (handleAutoMode): " + autoMode);
		if (autoMode) {
			let ret = await startAutoMode(TASK_NAME);
			if (ret == -1) {
				console.log("Auto Mode already activated");
			}
		} else {
			let ret = await stopAutoMode(TASK_NAME);
			if (ret == -1) {
				console.log("Auto Mode already deactivated");
			}
		}
	}, [autoMode]);

	useDidMountEffect(async () => {
		let res = await callTapoDevice(powerState);
		if (res.device_on !== powerState) {
			setPowerState(res.device_on);
		}
	}, [powerState]);

	return (
		<View style={styles.container}>
			<View
				style={{
					flex: 1,
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
						justifyContent: "center",
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
							onValueChange={() => {
								setPowerState((prev) => !prev);
							}}
							value={powerState}
						/>
					</View>
				</View>
			</View>
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
};
