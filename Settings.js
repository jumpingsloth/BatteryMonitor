import React, { useState, useEffect } from "react";
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
		edit: {
			padding: 20,
		},
		line: {
			flexDirection: "row",
			marginTop: 12,
			justifyContent: "center",
			alignItems: "center",
		},
	};

	return (
		<View style={styles.edit}>
			<Text style={styles.text}>{props.name}</Text>
			<View style={styles.line}>
				<View style={{ flex: 9 }}>
					<TextInput
						style={styles.input}
						onChangeText={props.update}
						value={props.value.toString()}
						keyboardType="numeric"
					/>
				</View>

				<View style={{ flex: 2 }}>
					<Button title="Done" onPress={Keyboard.dismiss}></Button>
				</View>
			</View>
		</View>
	);
}

export default function Settings() {
	const Separator = () => <View style={styles.separator} />;

	const [upperLimit, setUpperLimit] = useState(0);
	const [lowerLimit, setLowerLimit] = useState(0);

	return (
		<View style={styles.container}>
			<TextEditComponent
				name="Upper Battery Limit %"
				value={upperLimit}
				update={setUpperLimit}
			/>
			<TextEditComponent
				name="Lower Battery Limit %"
				value={lowerLimit}
				update={setLowerLimit}
			/>
		</View>
	);
}

const styles = {
	container: {
		flex: 1,
		paddingVertical: 20,
		// alignItems: "center",
		// justifyContent: "center",
	},
	text: {
		fontSize: 15,
		fontWeight: "bold",
	},
	separator: {
		marginVertical: 8,
		borderBottomColor: "grey",
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
};
