import { useNavigate } from "@tanstack/react-router";
import { Effect } from "effect";
import { useContext } from "react";

import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js";
import { verifyCredentialsExisting } from "@/lib/credentials/store";

export function useCredentialsForm() {
	const store = useContext(CredentialsStoreContext);

	const snap = store.getSnapshot();
	const hasExisting = verifyCredentialsExisting(snap);

	const navigate = useNavigate();
	const onSubmit = (url: string, key: string) => {
		Effect.runSync(store.setCredentials(url, key));
		navigate({ to: "/" });
	};

	if (hasExisting) {
		const existingUrl = snap.credentials.url;
		return {
			onSubmit,
			hasExisting,
			existingUrl,
		};
	} else {
		return {
			onSubmit,
			hasExisting,
		};
	}
}
