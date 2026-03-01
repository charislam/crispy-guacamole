import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

import { cleanupLastApp } from "./render-app.js";

beforeEach(() => {
	localStorage.clear();
});

afterEach(async () => {
	await cleanupLastApp();
	document.body.innerHTML = "";
});
