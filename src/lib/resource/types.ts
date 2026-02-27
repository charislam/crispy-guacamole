export type ResourceStatus = "idle" | "pending" | "ready" | "error";

type BaseResourceState<A, E> = {
	status: ResourceStatus;
	data: A | null;
	error: E | null;
};

export type IdleResourceState<A, E> = BaseResourceState<A, E> & {
	status: "idle";
	data: null;
	error: null;
};

export type PendingResourceState<A, E> = BaseResourceState<A, E> & {
	status: "pending";
	data: null;
	error: null;
};

export type ReadyResourceState<A, E> = BaseResourceState<A, E> & {
	status: "ready";
	data: A;
	error: null;
};

export type ErrorResourceState<A, E> = BaseResourceState<A, E> & {
	status: "error";
	data: null;
	error: E;
};

export type ResourceState<A, E> =
	| IdleResourceState<A, E>
	| PendingResourceState<A, E>
	| ReadyResourceState<A, E>
	| ErrorResourceState<A, E>;
