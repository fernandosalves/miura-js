/**
 * portal - Render a node into a target (e.g., document.body).
 * Usage: portal(node, document.body)
 */
export function portal(node: Node, target: HTMLElement = document.body) {
  target.appendChild(node);
} 