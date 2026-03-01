import { effect } from "@preact/signals-core";
import { Effect } from "effect";

import { navigate } from "@/app/router.js";
import type { RouteContext } from "@/app/router.js";
import { el } from "@/lib/dom.js";
import { fromStore } from "@/lib/signals.js";
import { verifyCredentialsExisting } from "@/lib/credentials/store.js";

export const credentialsRoute = {
	path: "/credentials",
	mount: (container: Element, ctx: RouteContext) =>
		mountCredentialsPage(container, ctx),
};

function mountCredentialsPage(container: Element, ctx: RouteContext): () => void {
	const { sig: credentialsSig, dispose: disposeCredentialsSig } = fromStore(ctx.credentialsStore);

	// Build outer wrapper
	const wrapper = el("div", {
		class: "flex items-center justify-center min-h-screen p-4",
	});

	// Card
	const card = el("div", { class: "w-full max-w-md rounded-lg border p-6 shadow-sm" });

	// Card header
	const cardHeader = el("div", { class: "mb-6" });
	const cardTitle = el("h2", { class: "text-xl font-bold" }, "Connect to Supabase");
	const cardDesc = el(
		"p",
		{ class: "text-sm text-muted-foreground mt-1" },
		"Enter your Supabase project URL and API key to get started.",
	);
	cardHeader.append(cardTitle, cardDesc);

	// Form
	const form = el("form", { class: "space-y-4" });

	// URL field
	const urlField = el("div", { class: "space-y-2" });
	const urlLabel = el("label", { for: "url", class: "text-sm font-medium" }, "Project URL");
	const urlInput = document.createElement("input");
	urlInput.id = "url";
	urlInput.name = "url";
	urlInput.type = "url";
	urlInput.required = true;
	urlInput.className =
		"flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:outline-none";
	urlField.append(urlLabel, urlInput);

	// Key field
	const keyField = el("div", { class: "space-y-2" });
	const keyLabel = el("label", { for: "key", class: "text-sm font-medium" }, "API Key");
	const keyInput = document.createElement("input");
	keyInput.id = "key";
	keyInput.name = "key";
	keyInput.type = "password";
	keyInput.placeholder = "your-anon-or-service-key";
	keyInput.required = true;
	keyInput.className =
		"flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:outline-none";
	keyField.append(keyLabel, keyInput);

	// Submit button
	const submitBtn = document.createElement("button");
	submitBtn.type = "submit";
	submitBtn.className =
		"inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground";
	submitBtn.textContent = "Save credentials";

	form.append(urlField, keyField, submitBtn);
	card.append(cardHeader, form);
	wrapper.appendChild(card);
	container.appendChild(wrapper);

	// Reactively update URL placeholder from the store
	const stopEffect = effect(() => {
		const snap = credentialsSig.value;
		if (verifyCredentialsExisting(snap)) {
			urlInput.placeholder = snap.credentials.url;
		} else {
			urlInput.placeholder = "https://your-project.supabase.co";
		}
	});

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const data = new FormData(form);
		const url = data.get("url") as string;
		const key = data.get("key") as string;
		Effect.runSync(ctx.credentialsStore.setCredentials(url, key));
		navigate("/");
	};
	form.addEventListener("submit", handleSubmit);

	return () => {
		stopEffect();
		disposeCredentialsSig();
		form.removeEventListener("submit", handleSubmit);
		wrapper.remove();
	};
}
