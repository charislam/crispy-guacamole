import { useNavigate } from "@tanstack/react-router";
import { Effect } from "effect";
import { useCallback, useContext, useState } from "react";

import { CredentialsStoreContext } from "@/lib/credentials/credentials-store.js";
import type { KnownCredentialsState } from "@/lib/credentials/types.js";
import { useCredentials } from "@/lib/hooks/useCredentials.js";
import { useBuckets } from "./useBuckets.js";
import { useCreateBucket } from "./useCreateBucket.js";
import { useDeleteBucket } from "./useDeleteBucket.js";

export function useHomePage() {
	const store = useContext(CredentialsStoreContext);
	// beforeLoad in the route guarantees status === "known" here
	const { credentials } = useCredentials(store) as KnownCredentialsState;
	const { state: bucketsState, refresh } = useBuckets(credentials);
	const navigate = useNavigate();
	const [showCreateForm, setShowCreateForm] = useState(false);

	const onClearCredentials = () => {
		Effect.runSync(store.clearCredentials());
		navigate({ to: "/credentials" });
	};

	const onToggleCreateForm = useCallback(() => {
		setShowCreateForm((v) => !v);
	}, []);

	const onCreateSuccess = useCallback(() => {
		setShowCreateForm(false);
		refresh();
	}, [refresh]);

	const onDeleteSuccess = useCallback(() => {
		refresh();
	}, [refresh]);

	const { submit: submitCreateBucket, status: createBucketStatus } =
		useCreateBucket(credentials, onCreateSuccess);
	const { submit: submitDeleteBucket, status: deleteBucketStatus } =
		useDeleteBucket(credentials, onDeleteSuccess);

	return {
		bucketsState,
		onClearCredentials,
		showCreateForm,
		onToggleCreateForm,
		submitCreateBucket,
		createBucketStatus,
		submitDeleteBucket,
		deleteBucketStatus,
	};
}
