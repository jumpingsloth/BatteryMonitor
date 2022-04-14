import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

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
