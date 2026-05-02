import type { NodeCanvasNode } from '../types.js';

export function applyDefaultLayout(nodes: NodeCanvasNode[]): NodeCanvasNode[] {
  const columnWidth = 600; // Increased for better breathing room
  const verticalGap = 120; // Space between cards in the same column
  const startX = 100;
  const startY = 100;

  // Track the vertical tail for each depth column
  const columnTails = new Map<number, number>();

  return nodes.map((node) => {
    const depth = node.depth ?? 0;
    
    // Determine the Y position based on current height of this column
    const currentY = columnTails.get(depth) ?? startY;
    
    // Dynamic height estimate based on node content
    const nodeHeight = node.sections?.reduce((acc, s) => acc + (s.items.length * 30 + 40), 100) ?? 300;
    const finalHeight = Math.max(200, Math.min(600, nodeHeight));

    // Update column tail for next node
    columnTails.set(depth, currentY + finalHeight + verticalGap);

    const x = startX + depth * columnWidth;
    const y = currentY;

    let width = 360;
    if (node.type === 'signal') width = 280;
    if (node.type === 'store') width = 300;

    return {
      ...node,
      x,
      y,
      width,
    };
  });
}
