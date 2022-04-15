import React, { useEffect, useRef } from "react";

export const useDidMountEffect = (func, deps, cycles = 1 /*, on_init */) => {
	const mountingCycles = useRef(0);

	useEffect(() => {
		if (mountingCycles.current >= cycles) {
			func();
		} else {
			// if (on_init) {
			// 	on_init(() => {
			// 		didMount.current = true;
			// 	});
			// } else {
			// 	didMount.current = true;
			// }
			++mountingCycles.current;
		}
	}, deps);
};
