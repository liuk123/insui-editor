import { type Editor, Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import type { EditorView } from '@tiptap/pm/view';

interface TableHandlesOptions {
  handleOffset: number;
  allowReorder: boolean;
}

type DragOrientation = 'row' | 'column';

interface DragState {
  orientation: DragOrientation;
  table: HTMLTableElement;
  fromIndex: number;
  toIndex: number;
}

interface TableNodeInfo {
  tableNode: ProseMirrorNode;
  tablePos: number;
}

interface HoverContext {
  table: HTMLTableElement;
  wrapper: HTMLElement;
  rowIndex: number;
  colIndex: number;
}

const tableHandlesPluginKey = new PluginKey('tableHandles');

export const TableHandles = Extension.create<TableHandlesOptions>({
  name: 'tableHandles',

  addOptions() {
    return {
      handleOffset: 34,
      allowReorder: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tableHandlesPluginKey,
        view: (view) => new TableHandlesView(this.editor, view, this.options),
      }),
    ];
  },
});

class TableHandlesView {
  private readonly editorView: EditorView;

  private readonly host: HTMLElement;

  private readonly rowControls: HTMLDivElement;

  private readonly colControls: HTMLDivElement;

  private readonly dropIndicator: HTMLDivElement;

  private readonly rowMainHandle: HTMLButtonElement;

  private readonly colMainHandle: HTMLButtonElement;

  private readonly rowAddButton: HTMLButtonElement;

  private readonly rowRemoveButton: HTMLButtonElement;

  private readonly colAddButton: HTMLButtonElement;

  private readonly colRemoveButton: HTMLButtonElement;

  private activeWrapper: HTMLElement | null = null;

  private activeTable: HTMLTableElement | null = null;

  private activeRowIndex: number | null = null;

  private activeColIndex: number | null = null;

  private dragState: DragState | null = null;

  constructor(
    private readonly editor: Editor,
    view: EditorView,
    private readonly options: TableHandlesOptions,
  ) {
    this.editorView = view;
    this.host = document.createElement('div');
    this.host.className = 'ins-table-handles';

    this.rowControls = document.createElement('div');
    this.rowControls.className = 'ins-table-row-controls';
    this.colControls = document.createElement('div');
    this.colControls.className = 'ins-table-col-controls';
    this.dropIndicator = document.createElement('div');
    this.dropIndicator.className = 'ins-table-drop-indicator';

    this.rowMainHandle = this.createButton('::', 'ins-table-handle-main', '选中并拖拽行');
    this.colMainHandle = this.createButton('::', 'ins-table-handle-main', '选中并拖拽列');
    this.rowAddButton = this.createButton('+', 'ins-table-handle-action', '下方插入行');
    this.rowRemoveButton = this.createButton('-', 'ins-table-handle-action', '删除当前行');
    this.colAddButton = this.createButton('+', 'ins-table-handle-action', '右侧插入列');
    this.colRemoveButton = this.createButton('-', 'ins-table-handle-action', '删除当前列');

    this.rowControls.append(this.rowMainHandle, this.rowAddButton, this.rowRemoveButton);
    this.colControls.append(this.colMainHandle, this.colAddButton, this.colRemoveButton);
    this.host.append(this.rowControls, this.colControls, this.dropIndicator);

    this.bindEvents();
  }

  public update(): void {
    if (!this.editor.isEditable) {
      this.hideControls();
      return;
    }

    if (this.activeTable && !this.activeTable.isConnected) {
      this.hideControls();
    }
  }

  public destroy(): void {
    this.editorView.dom.removeEventListener('mousemove', this.handleMouseMove);
    this.editorView.dom.removeEventListener('mouseleave', this.handleMouseLeave);
    this.editorView.root.removeEventListener('dragover', this.handleDragOver as EventListener);
    this.editorView.root.removeEventListener('drop', this.handleDrop as EventListener);
    this.editorView.root.removeEventListener('dragend', this.handleDragEnd as EventListener);
    this.rowMainHandle.removeEventListener('click', this.handleRowSelect);
    this.colMainHandle.removeEventListener('click', this.handleColSelect);
    this.rowAddButton.removeEventListener('click', this.handleAddRow);
    this.rowRemoveButton.removeEventListener('click', this.handleRemoveRow);
    this.colAddButton.removeEventListener('click', this.handleAddCol);
    this.colRemoveButton.removeEventListener('click', this.handleRemoveCol);
    this.rowMainHandle.removeEventListener('dragstart', this.handleRowDragStart);
    this.colMainHandle.removeEventListener('dragstart', this.handleColDragStart);
    this.rowMainHandle.removeEventListener('dragend', this.handleDragEnd);
    this.colMainHandle.removeEventListener('dragend', this.handleDragEnd);
    this.detachHost();
  }

  private bindEvents(): void {
    this.editorView.dom.addEventListener('mousemove', this.handleMouseMove);
    this.editorView.dom.addEventListener('mouseleave', this.handleMouseLeave);

    this.editorView.root.addEventListener('dragover', this.handleDragOver as EventListener);
    this.editorView.root.addEventListener('drop', this.handleDrop as EventListener);
    this.editorView.root.addEventListener('dragend', this.handleDragEnd as EventListener);

    this.rowMainHandle.addEventListener('click', this.handleRowSelect);
    this.colMainHandle.addEventListener('click', this.handleColSelect);
    this.rowAddButton.addEventListener('click', this.handleAddRow);
    this.rowRemoveButton.addEventListener('click', this.handleRemoveRow);
    this.colAddButton.addEventListener('click', this.handleAddCol);
    this.colRemoveButton.addEventListener('click', this.handleRemoveCol);

    this.rowMainHandle.draggable = this.options.allowReorder;
    this.colMainHandle.draggable = this.options.allowReorder;
    this.rowMainHandle.addEventListener('dragstart', this.handleRowDragStart);
    this.colMainHandle.addEventListener('dragstart', this.handleColDragStart);
    this.rowMainHandle.addEventListener('dragend', this.handleDragEnd);
    this.colMainHandle.addEventListener('dragend', this.handleDragEnd);
  }

  private readonly handleMouseMove = (event: MouseEvent): void => {
    if (this.dragState) {
      return;
    }

    if (!this.editor.isEditable) {
      this.hideControls();
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement) || !this.editorView.dom.contains(target)) {
      this.hideControls();
      return;
    }

    // Keep current context while the cursor moves on top of handle controls.
    if (this.host.contains(target)) {
      return;
    }

    const cell = target.closest('td, th');
    if (!(cell instanceof HTMLTableCellElement)) {
      this.hideControls();
      return;
    }

    const context = this.getHoverContext(cell);
    if (!context) {
      this.hideControls();
      return;
    }

    this.showControls(context, cell);
  };

  private readonly handleMouseLeave = (): void => {
    if (!this.dragState) {
      this.hideControls();
    }
  };

  private readonly handleRowSelect = (event: Event): void => {
    event.preventDefault();
    this.selectCurrentRow();
  };

  private readonly handleColSelect = (event: Event): void => {
    event.preventDefault();
    this.selectCurrentColumn();
  };

  private readonly handleAddRow = (event: Event): void => {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }

    this.editor.chain().focus().addRowAfter().run();
  };

  private readonly handleRemoveRow = (event: Event): void => {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }

    this.editor.chain().focus().deleteRow().run();
  };

  private readonly handleAddCol = (event: Event): void => {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }

    this.editor.chain().focus().addColumnAfter().run();
  };

  private readonly handleRemoveCol = (event: Event): void => {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }

    this.editor.chain().focus().deleteColumn().run();
  };

  private readonly handleRowDragStart = (event: DragEvent): void => {
    if (!this.options.allowReorder || this.activeTable === null || this.activeRowIndex === null) {
      event.preventDefault();
      return;
    }

    this.dragState = {
      orientation: 'row',
      table: this.activeTable,
      fromIndex: this.activeRowIndex,
      toIndex: this.activeRowIndex,
    };

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', 'table-row-handle');
    }
  };

  private readonly handleColDragStart = (event: DragEvent): void => {
    if (!this.options.allowReorder || this.activeTable === null || this.activeColIndex === null) {
      event.preventDefault();
      return;
    }

    this.dragState = {
      orientation: 'column',
      table: this.activeTable,
      fromIndex: this.activeColIndex,
      toIndex: this.activeColIndex,
    };

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', 'table-column-handle');
    }
  };

  private readonly handleDragOver = (event: DragEvent): void => {
    if (!this.dragState) {
      return;
    }

    const targetCell = this.getTargetCell(event.target);
    if (!targetCell || targetCell.closest('table') !== this.dragState.table) {
      return;
    }

    const hoverContext = this.getHoverContext(targetCell);
    if (!hoverContext) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    this.dragState.toIndex =
      this.dragState.orientation === 'row' ? hoverContext.rowIndex : hoverContext.colIndex;

    this.showControls(hoverContext, targetCell);
    this.updateDropIndicator(targetCell);
  };

  private readonly handleDrop = (event: DragEvent): void => {
    if (!this.dragState) {
      return;
    }

    event.preventDefault();
    const dragState = this.dragState;
    this.dragState = null;

    if (dragState.fromIndex !== dragState.toIndex) {
      this.reorderTable(dragState);
    }

    this.resetDropIndicator();
  };

  private readonly handleDragEnd = (): void => {
    this.dragState = null;
    this.resetDropIndicator();
  };

  private createButton(text: string, className: string, title: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `ins-table-handle-button ${className}`;
    button.textContent = text;
    button.title = title;
    return button;
  }

  private getHoverContext(cell: HTMLTableCellElement): HoverContext | null {
    const table = cell.closest('table');
    const wrapper = table?.closest('.tableWrapper');
    const row = cell.parentElement;
    const section = row?.parentElement;

    if (
      !(table instanceof HTMLTableElement) ||
      !(wrapper instanceof HTMLElement) ||
      !(row instanceof HTMLTableRowElement) ||
      !(section instanceof HTMLElement)
    ) {
      return null;
    }

    const rowIndex = Array.prototype.indexOf.call(section.children, row) as number;
    const colIndex = Array.prototype.indexOf.call(row.children, cell) as number;

    if (rowIndex < 0 || colIndex < 0) {
      return null;
    }

    return { table, wrapper, rowIndex, colIndex };
  }

  private showControls(context: HoverContext, cell: HTMLTableCellElement): void {
    this.activeTable = context.table;
    this.activeWrapper = context.wrapper;
    this.activeRowIndex = context.rowIndex;
    this.activeColIndex = context.colIndex;

    if (!context.wrapper.classList.contains('ins-table-handles-host')) {
      context.wrapper.classList.add('ins-table-handles-host');
    }

    if (this.host.parentElement !== context.wrapper) {
      this.detachHost();
      context.wrapper.appendChild(this.host);
    }

    const wrapperRect = context.wrapper.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const offset = this.options.handleOffset;

    this.rowControls.style.left = `${offset}px`;
    this.rowControls.style.top = `${cellRect.top - wrapperRect.top + (cellRect.height / 2)}px`;

    this.colControls.style.left = `${cellRect.left - wrapperRect.left + (cellRect.width / 2)}px`;
    this.colControls.style.top = `${offset}px`;

    this.host.style.display = 'block';
  }

  private hideControls(): void {
    if (this.dragState) {
      return;
    }

    this.activeTable = null;
    this.activeWrapper = null;
    this.activeRowIndex = null;
    this.activeColIndex = null;
    this.host.style.display = 'none';
    this.resetDropIndicator();
  }

  private detachHost(): void {
    if (this.host.parentElement) {
      this.host.parentElement.removeChild(this.host);
    }
  }

  private ensureCurrentCellSelection(): boolean {
    if (this.activeRowIndex === null || this.activeColIndex === null) {
      return false;
    }

    const tableInfo = this.getCurrentTableInfo();
    if (!tableInfo) {
      return false;
    }

    const anchorCellPos = this.getCellPos(
      tableInfo.tableNode,
      tableInfo.tablePos,
      this.activeRowIndex,
      this.activeColIndex,
    );

    if (anchorCellPos === null) {
      return false;
    }

    const tr = this.editorView.state.tr.setSelection(
      CellSelection.create(this.editorView.state.doc, anchorCellPos, anchorCellPos),
    );
    this.editorView.dispatch(tr);
    return true;
  }

  private selectCurrentRow(): void {
    if (this.activeRowIndex === null) {
      return;
    }

    const tableInfo = this.getCurrentTableInfo();
    if (!tableInfo) {
      return;
    }

    const row = tableInfo.tableNode.child(this.activeRowIndex);
    if (!row || row.childCount === 0) {
      return;
    }

    const anchor = this.getCellPos(tableInfo.tableNode, tableInfo.tablePos, this.activeRowIndex, 0);
    const head = this.getCellPos(
      tableInfo.tableNode,
      tableInfo.tablePos,
      this.activeRowIndex,
      row.childCount - 1,
    );
    if (anchor === null || head === null) {
      return;
    }

    this.editorView.dispatch(
      this.editorView.state.tr.setSelection(CellSelection.create(this.editorView.state.doc, anchor, head)),
    );
    this.editor.commands.focus();
  }

  private selectCurrentColumn(): void {
    if (this.activeColIndex === null) {
      return;
    }

    const tableInfo = this.getCurrentTableInfo();
    if (!tableInfo) {
      return;
    }

    const rowCount = tableInfo.tableNode.childCount;
    if (rowCount === 0) {
      return;
    }

    const firstAnchor = this.getCellPos(tableInfo.tableNode, tableInfo.tablePos, 0, this.activeColIndex);
    const lastAnchor = this.getCellPos(
      tableInfo.tableNode,
      tableInfo.tablePos,
      rowCount - 1,
      this.activeColIndex,
    );
    if (firstAnchor === null || lastAnchor === null) {
      return;
    }

    this.editorView.dispatch(
      this.editorView.state.tr.setSelection(
        CellSelection.create(this.editorView.state.doc, firstAnchor, lastAnchor),
      ),
    );
    this.editor.commands.focus();
  }

  private getCurrentTableInfo(): TableNodeInfo | null {
    if (!this.activeTable) {
      return null;
    }

    const firstCell = this.activeTable.querySelector('td, th');
    if (!(firstCell instanceof HTMLTableCellElement)) {
      return null;
    }

    const cellPos = this.editorView.posAtDOM(firstCell, 0) - 1;
    return this.resolveTableInfoByPos(cellPos);
  }

  private resolveTableInfoByPos(pos: number): TableNodeInfo | null {
    const resolvedPos = this.editorView.state.doc.resolve(Math.max(pos, 0));
    for (let depth = resolvedPos.depth; depth > 0; depth -= 1) {
      const node = resolvedPos.node(depth);
      if (node.type.name === 'table') {
        return {
          tableNode: node,
          tablePos: resolvedPos.before(depth),
        };
      }
    }

    return null;
  }

  private getCellPos(
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

    let rowPos = tablePos + 1;
    for (let index = 0; index < rowIndex; index += 1) {
      rowPos += tableNode.child(index).nodeSize;
    }

    let cellPos = rowPos + 1;
    for (let index = 0; index < colIndex; index += 1) {
      cellPos += row.child(index).nodeSize;
    }

    return cellPos;
  }

  private getTargetCell(target: EventTarget | null): HTMLTableCellElement | null {
    if (!(target instanceof HTMLElement)) {
      return null;
    }

    const cell = target.closest('td, th');
    return cell instanceof HTMLTableCellElement ? cell : null;
  }

  private updateDropIndicator(targetCell: HTMLTableCellElement): void {
    if (!this.dragState || !this.activeWrapper) {
      return;
    }

    const wrapperRect = this.activeWrapper.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();
    this.dropIndicator.style.display = 'block';

    if (this.dragState.orientation === 'row') {
      const table = targetCell.closest('table');
      if (!(table instanceof HTMLTableElement)) {
        return;
      }

      this.dropIndicator.style.width = `${this.dragState.table.getBoundingClientRect().width}px`;
      this.dropIndicator.style.height = '2px';
      this.dropIndicator.style.left = `${table.getBoundingClientRect().left - wrapperRect.left}px`;
      this.dropIndicator.style.top = `${cellRect.top - wrapperRect.top}px`;
    } else {
      this.dropIndicator.style.width = '2px';
      this.dropIndicator.style.height = `${this.dragState.table.getBoundingClientRect().height}px`;
      this.dropIndicator.style.left = `${cellRect.left - wrapperRect.left}px`;
      this.dropIndicator.style.top = `${this.dragState.table.getBoundingClientRect().top - wrapperRect.top}px`;
    }
  }

  private resetDropIndicator(): void {
    this.dropIndicator.style.display = 'none';
  }

  private reorderTable(dragState: DragState): void {
    const tableInfo = this.getCurrentTableInfo();
    if (!tableInfo) {
      return;
    }

    const { tableNode, tablePos } = tableInfo;
    if (dragState.orientation === 'row') {
      const reorderedRows = Array.from({ length: tableNode.childCount }, (_, index) =>
        tableNode.child(index),
      );
      const movedRow = reorderedRows.splice(dragState.fromIndex, 1)[0];
      if (!movedRow) {
        return;
      }
      reorderedRows.splice(dragState.toIndex, 0, movedRow);
      const newTable = tableNode.type.create(tableNode.attrs, reorderedRows, tableNode.marks);
      this.editorView.dispatch(
        this.editorView.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable),
      );
      return;
    }

    if (!this.canReorderColumns(tableNode)) {
      return;
    }

    const reorderedRows = Array.from({ length: tableNode.childCount }, (_, rowIndex) => {
      const row = tableNode.child(rowIndex);
      const cells = Array.from({ length: row.childCount }, (_, colIndex) => row.child(colIndex));
      const movedCell = cells.splice(dragState.fromIndex, 1)[0];
      if (!movedCell) {
        return row;
      }
      cells.splice(dragState.toIndex, 0, movedCell);
      return row.type.create(row.attrs, cells, row.marks);
    });

    const newTable = tableNode.type.create(tableNode.attrs, reorderedRows, tableNode.marks);
    this.editorView.dispatch(
      this.editorView.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable),
    );
  }

  private canReorderColumns(tableNode: ProseMirrorNode): boolean {
    if (tableNode.childCount === 0) {
      return false;
    }

    const expectedCellCount = tableNode.child(0).childCount;
    for (let rowIndex = 0; rowIndex < tableNode.childCount; rowIndex += 1) {
      const row = tableNode.child(rowIndex);
      if (row.childCount !== expectedCellCount) {
        return false;
      }

      for (let colIndex = 0; colIndex < row.childCount; colIndex += 1) {
        const cell = row.child(colIndex);
        const attrs = cell.attrs as Record<string, unknown>;
        const rowSpan = Number(attrs['rowspan'] ?? 1);
        const colSpan = Number(attrs['colspan'] ?? 1);
        if (rowSpan !== 1 || colSpan !== 1) {
          return false;
        }
      }
    }

    return true;
  }
}
