// import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Switch } from "react-native";
import * as Battery from "expo-battery";
import * as Progress from "react-native-progress";

export default function Home() {
	// const [time, setTime] = useState(Date.now());
	const [battery, setBattery] = useState(null);
	const [powerState, setPowerState] = useState(false);

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

	useEffect(() => {
		// const interval = setInterval(() => setTime(Date.now()), 10 * 1000);
		_subscribe();

		return () => {
			// clearInterval(interval);
			_unsubscribe();
		};
	}, []);

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

				<View style={styles.toggleButton}>
					<Switch
						onValueChange={() => {
							setPowerState((prev) => !prev);
						}}
						value={powerState}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = {
	container: {
		flex: 1,
		flexDirection: "column",
	},
	text: {
		fontSize: 15,
	},
	toggleButton: {
		marginTop: 60,
	},
};
