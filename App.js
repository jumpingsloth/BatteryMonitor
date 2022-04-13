// import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Switch } from "react-native";
import * as Battery from "expo-battery";
import * as Progress from "react-native-progress";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

export default function App() {
	// const [time, setTime] = useState(Date.now());
	const [batteryLevel, setBatteryLevel] = useState(null);
	const [powerState, setPowerState] = useState(false);

	let _subscription = null;

	const _subscribe = async () => {
		const _batteryLevel = await Battery.getBatteryLevelAsync();
		setBatteryLevel(_batteryLevel);
		_subscription = Battery.addBatteryLevelListener(({ _batteryLevel }) => {
			setBatteryLevel(_batteryLevel);
			console.log("batteryLevel changed!", batteryLevel);
		});
	};

	const _unsubscribe = () => {
		_subscription && _subscription.remove();
		_subscription = null;
	};

	useEffect(() => {
		// const interval = setInterval(() => setTime(Date.now()), 10 * 1000);
		_subscribe();

		return () => {
			// clearInterval(interval);
			_unsubscribe();
		};
	}, []);

	const Separator = () => <View style={styles.separator} />;

	return (
		<View style={styles.container}>
			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: powerState
						? "rgb(52, 199, 89)"
						: "rgb(199, 199, 204)",
				}}
			>
				<Text style={styles.text}>
					{powerState ? "Enabled" : "Disabled"}
				</Text>
			</View>

			<View
				style={{
					flex: 10,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Progress.Circle
					progress={batteryLevel}
					size={180}
					borderWidth={2}
					thickness={7}
					showsText={true}
					formatText={(progress) => {
						return (progress * 100).toFixed(0) + " %";
					}}
					strokeCap="round"
				/>

				<View style={styles.toggleButton}>
					<Switch
						onValueChange={() => {
							setPowerState((prev) => !prev);
						}}
						value={powerState}
					/>
				</View>
			</View>

			<View
				style={{
					flex: 2,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: powerState
						? "rgb(52, 199, 89)"
						: "rgb(199, 199, 204)",
				}}
			>
				<Text style={styles.text}>
					{powerState ? "Enabled" : "Disabled"}
				</Text>
			</View>
		</View>
	);
}

const styles = {
	container: {
		flex: 1,
		// alignItems: "center",
		// justifyContent: "center",
		flexDirection: "column",
	},
	text: {
		fontSize: 20,
		marginTop: 35,
	},
	toggleButton: {
		marginTop: 60,
	},
};
