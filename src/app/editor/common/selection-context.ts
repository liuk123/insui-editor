import type { Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model';
import { AllSelection, NodeSelection, type EditorState, type Selection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import { findTableInResolvedPos } from './table-selection';

export type Attrs = Record<string, unknown>;
export type InsEditorSelectionKind = 'text' | 'node' | 'cell' | 'multi-node' | 'all' | 'other';
export type InsEditorTableCellNodeName = 'tableCell' | 'tableHeader';

export class ActiveNodePath {
  constructor(
    public readonly node: string,
    public readonly nodePos: number,
    public readonly attrs: Attrs = {},
    public readonly isEmpty = false,
    public readonly depth = 0,
    public readonly isBlock = false,
    public readonly isAtom = false,
  ) {}
}

export interface InsEditorTableSelectionContext {
  readonly tablePos: number;
  readonly tableDepth: number;
  readonly cellPos: number | null;
  readonly cellNodeName: InsEditorTableCellNodeName | null;
}

export interface InsEditorSelectionContext {
  readonly kind: InsEditorSelectionKind;
  readonly from: number;
  readonly to: number;
  readonly empty: boolean;
  readonly anchorPath: ReadonlyArray<ActiveNodePath>;
  readonly headPath: ReadonlyArray<ActiveNodePath>;
  readonly activeNode: ActiveNodePath | null;
  readonly activeBlock: ActiveNodePath | null;
  readonly table: InsEditorTableSelectionContext | null;
  readonly markNames: ReadonlyArray<string>;
}

function createActiveNodePath(node: ProseMirrorNode, nodePos: number, depth: number): ActiveNodePath {
  return new ActiveNodePath(
    node.type.name,
    nodePos,
    (node.attrs ?? {}) as Attrs,
    node.isTextblock && node.content.size === 0,
    depth,
    node.isBlock,
    node.isAtom,
  );
}

function collectBlockPath($pos: ResolvedPos): ReadonlyArray<ActiveNodePath> {
  const path: ActiveNodePath[] = [];

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (!node.isBlock) {
      continue;
    }
    path.push(createActiveNodePath(node, $pos.before(depth), depth));
  }

  return path;
}

function getSelectionKind(selection: Selection): InsEditorSelectionKind {
  if (selection instanceof CellSelection) {
    return 'cell';
  }
  if (selection instanceof NodeSelection) {
    return 'node';
  }
  if (selection instanceof AllSelection) {
    return 'all';
  }

  const json = typeof selection.toJSON === 'function' ? selection.toJSON() : null;
  if (json && typeof json === 'object' && 'type' in json && json['type'] === 'multiple-node') {
    return 'multi-node';
  }

  return selection.empty || selection.$from.parent.isTextblock ? 'text' : 'other';
}

function getSelectionMarkNames(state: EditorState): ReadonlyArray<string> {
  const marks =
    state.selection.empty ?
      [...(state.storedMarks ?? []), ...state.selection.$from.marks()]
    : (state.selection.$from.marksAcross(state.selection.$to) ?? []);

  return [...new Set(marks.map((mark) => mark.type.name))].sort();
}

function getSelectedNode(selection: Selection): ActiveNodePath | null {
  if (!(selection instanceof NodeSelection)) {
    return null;
  }

  return createActiveNodePath(selection.node, selection.from, selection.$from.depth + 1);
}

function getTableContext(
  state: EditorState,
  selection: Selection,
  anchorPath: ReadonlyArray<ActiveNodePath>,
): InsEditorTableSelectionContext | null {
  const tableInfo =
    selection instanceof CellSelection ?
      findTableInResolvedPos(selection.$anchorCell)
    : findTableInResolvedPos(selection.$from);
  if (!tableInfo) {
    return null;
  }

  const cellEntry =
    anchorPath.find((entry) => entry.node === 'tableCell' || entry.node === 'tableHeader') ?? null;
  const cellNode =
    selection instanceof CellSelection ? state.doc.nodeAt(selection.$anchorCell.pos) : null;
  const cellNodeName =
    cellEntry?.node === 'tableCell' || cellEntry?.node === 'tableHeader' ? cellEntry.node
    : cellNode?.type.name === 'tableCell' || cellNode?.type.name === 'tableHeader' ? cellNode.type.name
    : null;
  const cellPos = cellEntry?.nodePos ?? (selection instanceof CellSelection ? selection.$anchorCell.pos : null);

  return {
    tablePos: tableInfo.tablePos,
    tableDepth: tableInfo.tableDepth,
    cellPos,
    cellNodeName,
  };
}

export function buildEditorSelectionContext(state: EditorState | null): InsEditorSelectionContext {
  if (!state) {
    return {
      kind: 'other',
      from: -1,
      to: -1,
      empty: true,
      anchorPath: [],
      headPath: [],
      activeNode: null,
      activeBlock: null,
      table: null,
      markNames: [],
    };
  }

  const { selection } = state;
  const anchorPath = collectBlockPath(selection.$from);
  const headPath = collectBlockPath(selection.$to);
  const activeNode = getSelectedNode(selection) ?? anchorPath[0] ?? null;
  const activeBlock =
    selection instanceof NodeSelection && selection.node.isBlock ? activeNode : anchorPath[0] ?? null;

  return {
    kind: getSelectionKind(selection),
    from: selection.from,
    to: selection.to,
    empty: selection.empty,
    anchorPath,
    headPath,
    activeNode,
    activeBlock,
    table: getTableContext(state, selection, anchorPath),
    markNames: getSelectionMarkNames(state),
  };
}

function areActiveNodePathsEqual(
  a: ReadonlyArray<ActiveNodePath>,
  b: ReadonlyArray<ActiveNodePath>,
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return !a.some(
    (item, index) =>
      item.node !== b[index]?.node ||
      item.nodePos !== b[index]?.nodePos ||
      item.isEmpty !== b[index]?.isEmpty ||
      item.depth !== b[index]?.depth ||
      item.attrs['level'] !== b[index]?.attrs['level'],
  );
}

function areMarksEqual(a: ReadonlyArray<string>, b: ReadonlyArray<string>): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return !a.some((item, index) => item !== b[index]);
}

function areTableContextsEqual(
  a: InsEditorTableSelectionContext | null,
  b: InsEditorTableSelectionContext | null,
): boolean {
  return (
    a?.tablePos === b?.tablePos &&
    a?.tableDepth === b?.tableDepth &&
    a?.cellPos === b?.cellPos &&
    a?.cellNodeName === b?.cellNodeName
  );
}

function isActiveNodePathEqual(a: ActiveNodePath | null, b: ActiveNodePath | null): boolean {
  return (
    a?.node === b?.node &&
    a?.nodePos === b?.nodePos &&
    a?.isEmpty === b?.isEmpty &&
    a?.depth === b?.depth &&
    a?.attrs['level'] === b?.attrs['level']
  );
}

export function isEditorSelectionContextEqual(
  a: InsEditorSelectionContext,
  b: InsEditorSelectionContext,
): boolean {
  return (
    a.kind === b.kind &&
    a.from === b.from &&
    a.to === b.to &&
    a.empty === b.empty &&
    areActiveNodePathsEqual(a.anchorPath, b.anchorPath) &&
    areActiveNodePathsEqual(a.headPath, b.headPath) &&
    isActiveNodePathEqual(a.activeNode, b.activeNode) &&
    isActiveNodePathEqual(a.activeBlock, b.activeBlock) &&
    areTableContextsEqual(a.table, b.table) &&
    areMarksEqual(a.markNames, b.markNames)
  );
}
