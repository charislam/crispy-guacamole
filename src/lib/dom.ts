export function el<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	attrs: Record<string, string> = {},
	...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
	for (const child of children) {
		node.appendChild(
			typeof child === "string" ? document.createTextNode(child) : child,
		);
	}
	return node;
}
