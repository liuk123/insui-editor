import type { Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model';

export interface InsTableNodeInfo {
  tableNode: ProseMirrorNode;
  tablePos: number;
  tableDepth: number;
}

export interface InsCellSelectionRange {
  anchor: number;
  head: number;
}

export function findTableInResolvedPos($pos: ResolvedPos): InsTableNodeInfo | null {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === 'table') {
      return {
        tableNode: node,
        tablePos: $pos.before(depth),
        tableDepth: depth,
      };
    }
  }

  return null;
}

export function getRowStartPos(
  tableNode: ProseMirrorNode,
  tablePos: number,
  rowIndex: number,
): number | null {
  if (rowIndex < 0 || rowIndex >= tableNode.childCount) {
    return null;
  }

  let rowPos = tablePos + 1;
  for (let index = 0; index < rowIndex; index += 1) {
    rowPos += tableNode.child(index).nodeSize;
  }

  return rowPos;
}

export function getTableCellPos(
  tableNode: ProseMirrorNode,
  tablePos: number,
  rowIndex: number,
  colIndex: number,
): number | null {
  if (rowIndex < 0 || rowIndex >= tableNode.childCount) {
    return null;
  }

  const row = tableNode.child(rowIndex);
  if (colIndex < 0 || colIndex >= row.childCount) {
    return null;
  }

  const rowPos = getRowStartPos(tableNode, tablePos, rowIndex);
  if (rowPos === null) {
    return null;
  }

  let cellPos = rowPos + 1;
  for (let index = 0; index < colIndex; index += 1) {
    cellPos += row.child(index).nodeSize;
  }

  return cellPos;
}

export function getRowSelectionRange(
  tableNode: ProseMirrorNode,
  tablePos: number,
  rowIndex: number,
): InsCellSelectionRange | null {
  if (rowIndex < 0 || rowIndex >= tableNode.childCount) {
    return null;
  }

  const row = tableNode.child(rowIndex);
  if (row.childCount === 0) {
    return null;
  }

  const anchor = getTableCellPos(tableNode, tablePos, rowIndex, 0);
  const head = getTableCellPos(tableNode, tablePos, rowIndex, row.childCount - 1);

  if (anchor === null || head === null) {
    return null;
  }

  return { anchor, head };
}

export function getColumnSelectionRange(
  tableNode: ProseMirrorNode,
  tablePos: number,
  colIndex: number,
): InsCellSelectionRange | null {
  if (tableNode.childCount === 0) {
    return null;
  }

  const firstRowIndex = 0;
  const lastRowIndex = tableNode.childCount - 1;
  const firstRow = tableNode.child(firstRowIndex);
  const lastRow = tableNode.child(lastRowIndex);

  if (colIndex < 0 || colIndex >= firstRow.childCount || colIndex >= lastRow.childCount) {
    return null;
  }

  const anchor = getTableCellPos(tableNode, tablePos, firstRowIndex, colIndex);
  const head = getTableCellPos(tableNode, tablePos, lastRowIndex, colIndex);
  if (anchor === null || head === null) {
    return null;
  }

  return { anchor, head };
}
