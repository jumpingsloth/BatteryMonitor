import * as SecureStore from "expo-secure-store";

export async function callTapoDevice(on_off) {
	let postData = JSON.stringify({
		email: await SecureStore.getItemAsync("email"),
		password: await SecureStore.getItemAsync("password"),
		devicename: await SecureStore.getItemAsync("devicename"),
		state: on_off,
	});

	const res = await fetch(await SecureStore.getItemAsync("server"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": postData.length,
		},
		body: postData,
	});

	const json_data = await res.json();
	console.log(json_data);

	return json_data;
}
