import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as SecureStore from "expo-secure-store";

export async function startAutoMode(taskname) {
	console.log("start automode");
	let isRegistered = await TaskManager.isTaskRegisteredAsync(taskname);
	if (!isRegistered) {
		console.log("registering task " + taskname);
		return BackgroundFetch.registerTaskAsync(taskname, {
			minimumInterval: 60 * 15,
			startOnBoot: true,
			stopOnTerminate: false,
		});
	} else {
		return -1;
	}
}

export async function stopAutoMode(taskname) {
	console.log("stop automode");
	let isRegistered = await TaskManager.isTaskRegisteredAsync(taskname);
	if (isRegistered) {
		console.log("unregistering task " + taskname);
		return BackgroundFetch.unregisterTaskAsync(taskname);
	} else {
		return -1;
	}
}

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
