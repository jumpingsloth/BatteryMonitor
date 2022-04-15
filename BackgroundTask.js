import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as tapo from "tp-link-tapo-connect";

// const fs = require("fs");

export async function startAutoMode(taskname) {
	console.log("start automode");
	let isRegistered = await TaskManager.isTaskRegisteredAsync(taskname);
	if (!isRegistered) {
		console.log("registering task " + taskname);
		return BackgroundFetch.registerTaskAsync(taskname, {
			minimumInterval: 10,
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

function get_credentials() {
	// let data = fs.readFileSync("credentials.txt");
	// let json_data = data.toJSON();
	// let email = data.email;
	// let password = data.password;

	return ["", ""];
}

export async function callTapoDevice(on_off) {
	const [email, password] = get_credentials();

	const cloudToken = await tapo.cloudLogin(email, password);
	const devices = await tapo.listDevices(cloudToken);
	let studio_device = devices.find((device) => {
		return device.deviceName == "Studio";
	});

	const deviceToken = await tapo.loginDevice(email, password, studio_device);
	const getDeviceInfoResponse = await tapo.getDeviceInfo(deviceToken);
	console.log(getDeviceInfoResponse);

	await tapo.turnOn(deviceToken);
}
