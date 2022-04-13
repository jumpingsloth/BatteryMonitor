import * as React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Home from "./Home.js";
import Settings from "./Settings.js";

const Tab = createBottomTabNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color, size }) => {
						let iconName;

						if (route.name === "Home") {
							iconName = "ios-home";
						} else if (route.name === "Settings") {
							iconName = "ios-settings";
						}

						return (
							<Ionicons
								name={iconName}
								size={size}
								color={color}
							/>
						);
					},
				})}
			>
				<Tab.Screen name="Home" component={Home} />
				<Tab.Screen name="Settings" component={Settings} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}
