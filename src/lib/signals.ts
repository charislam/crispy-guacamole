import { signal } from "@preact/signals-core";

export function fromStore<T>(store: {
	getSnapshot: () => T;
	subscribe: (cb: () => void) => () => void;
}): { sig: ReturnType<typeof signal<T>>; dispose: () => void } {
	const sig = signal(store.getSnapshot());
	const dispose = store.subscribe(() => {
		sig.value = store.getSnapshot();
	});
	return { sig, dispose };
}
