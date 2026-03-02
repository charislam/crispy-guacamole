import type { Route } from "./router.js";

type TrieNode = {
	literalChildren: Map<string, TrieNode>;
	paramChild: TrieNode | null;
	wildcardRoute: Route | null;
	route: Route | null;
};

function makeTrieNode(): TrieNode {
	return {
		literalChildren: new Map(),
		paramChild: null,
		wildcardRoute: null,
		route: null,
	};
}

export function buildRouteTrie(routes: Route[]): TrieNode {
	const root = makeTrieNode();
	for (const route of routes) {
		const segments = route.path.split("/").filter(Boolean);
		let node = root;
		let done = false;
		for (const seg of segments) {
			if (done) break;
			if (seg === "*") {
				node.wildcardRoute = route;
				done = true;
			} else if (seg.startsWith(":")) {
				if (!node.paramChild) node.paramChild = makeTrieNode();
				node = node.paramChild;
			} else {
				if (!node.literalChildren.has(seg)) {
					node.literalChildren.set(seg, makeTrieNode());
				}
				node = node.literalChildren.get(seg)!;
			}
		}
		if (!done) node.route = route;
	}
	return root;
}

function searchTrie(
	node: TrieNode,
	segments: string[],
	idx: number,
): Route | null {
	if (idx === segments.length) return node.route;

	const seg = segments[idx];

	// Literal first
	const literalChild = node.literalChildren.get(seg);
	if (literalChild) {
		const result = searchTrie(literalChild, segments, idx + 1);
		if (result) return result;
	}

	// Then param
	if (node.paramChild) {
		const result = searchTrie(node.paramChild, segments, idx + 1);
		if (result) return result;
	}

	// Then wildcard
	if (node.wildcardRoute) return node.wildcardRoute;

	return null;
}

export function matchRoute(trie: TrieNode, path: string): Route | null {
	const segments = path.split("/").filter(Boolean);
	return searchTrie(trie, segments, 0);
}
