import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

export async function startAutoMode(taskname) {
	if (!TaskManager.isTaskRegisteredAsync(taskname)) {
		console.log("registered task");
		return BackgroundFetch.registerTaskAsync(taskname, {
			minimumInterval: 5,
			startOnBoot: true,
			stopOnTerminate: false,
		});
	} else {
		return -1;
	}
}

export async function stopAutoMode(taskname) {
	if (TaskManager.isTaskRegisteredAsync(taskname)) {
		console.log("unregistered task");
		return BackgroundFetch.unregisterTaskAsync(taskname);
	} else {
		return -1;
	}
}
