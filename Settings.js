import React, { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import {
	ScrollView,
	TouchableOpacity,
	KeyboardAvoidingView,
} from "react-native";
import { useDidMountEffect } from "./custom_hooks.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
	StyleSheet,
	Text,
	View,
	Button,
	TextInput,
	Keyboard,
} from "react-native";

function TextEditComponent(props) {
	const styles = {
		input: {
			height: 40,
			backgroundColor: "rgb(229, 229, 234)",
			padding: 10,
			borderRadius: 10,
		},
		container: {
			padding: 15,
		},
		line: {
			marginTop: 10,
		},
	};

	return (
		<View style={styles.container}>
			<Text style={styles.text}>{props.name}</Text>
			<View style={styles.line}>
				<TextInput
					style={styles.input}
					onChangeText={props.update}
					value={props.value ? props.value.toString() : ""}
					keyboardType={
						props.keyboardType ? props.keyboardType : "default"
					}
					secureTextEntry={props.secureTextEntry}
				/>
			</View>
		</View>
	);
}

async function getValueFor(key) {
	let result = await SecureStore.getItemAsync(key);
	return result;
}

async function save(key, value) {
	await SecureStore.setItemAsync(key, value);
}

export default function Settings() {
	const Separator = () => <View style={styles.separator} />;

	const [upperLimit, setUpperLimit] = useState(null);
	const [lowerLimit, setLowerLimit] = useState(null);
	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);
	const [devicename, setDevicename] = useState(null);
	const [server, setServer] = useState(null);

	const [showBanner, setShowBanner] = useState(false);

	useEffect(async () => {
		setUpperLimit(await getValueFor("upperLimit"));
		setLowerLimit(await getValueFor("lowerLimit"));
		setEmail(await getValueFor("email"));
		setPassword(await getValueFor("password"));
		setDevicename(await getValueFor("devicename"));
		setServer(await getValueFor("server"));
	}, []);

	const onEditDone = async () => {
		await save("lowerLimit", lowerLimit ? lowerLimit.toString() : "");
		await save("upperLimit", upperLimit ? upperLimit.toString() : "");
		await save("email", email ? email.toString() : "");
		await save("password", password ? password.toString() : "");
		await save("devicename", devicename ? devicename.toString() : "");
		await save("server", server ? server.toString() : "");

		setShowBanner(true);
	};

	useDidMountEffect(() => {
		if (showBanner) {
			setTimeout(() => {
				setShowBanner(false);
			}, 3000);
		}
	}, [showBanner]);

	return (
		<KeyboardAwareScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
			resetScrollToCoords={{ x: 0, y: 0 }}
		>
			{showBanner && (
				<View style={styles.banner}>
					<Text style={styles.bannerText}>Save Successfull</Text>
				</View>
			)}

			<View style={{ paddingVertical: 20 }}>
				<TextEditComponent
					name="Upper Battery Limit %"
					value={upperLimit}
					update={setUpperLimit}
					keyboardType="numeric"
				/>
				<TextEditComponent
					name="Lower Battery Limit %"
					value={lowerLimit}
					update={setLowerLimit}
					keyboardType="numeric"
				/>
				<TextEditComponent
					name="Email"
					value={email}
					update={setEmail}
					keyboardType="email-address"
				/>
				<TextEditComponent
					name="Password"
					value={password}
					update={setPassword}
					secureTextEntry={true}
				/>

				<TextEditComponent
					name="Device Name"
					value={devicename}
					update={setDevicename}
				/>

				<TextEditComponent
					name="Server URL"
					value={server}
					update={setServer}
				/>

				<TouchableOpacity
					style={styles.saveButton}
					onPress={onEditDone}
				>
					<Text style={styles.saveButtonText}>Save Changes</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	);
}

const styles = {
	container: {
		// alignItems: "center",
	},
	contentContainer: {
		flex: 1,
		// justifyContent: "center",
		// alignItems: "center",
	},
	text: {
		fontSize: 15,
		fontWeight: "bold",
	},
	saveButton: {
		marginTop: 50,
		backgroundColor: "rgb(0, 122, 255)",
		padding: 10,
		color: "#fff",
		borderRadius: 10,
		width: 120,
		// marginHorizontal: "20%",
		height: 50,
		alignSelf: "center",
		justifyContent: "center",
		alignItems: "center",
	},
	saveButtonText: {
		color: "#fff",
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
	separator: {
		marginVertical: 8,
		borderBottomColor: "grey",
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
};
