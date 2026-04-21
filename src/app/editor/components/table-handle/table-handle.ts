import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { type Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { CellSelection } from '@tiptap/pm/tables';
import type { EditorView } from '@tiptap/pm/view';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  auditTime,
  BehaviorSubject,
  distinctUntilChanged,
  fromEvent,
  map,
  of,
  race,
  startWith,
  switchMap,
  take,
} from 'rxjs';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { AbstractInsEditor } from '../../common/editor-adapter';

type DragOrientation = 'row' | 'column';

interface DragState {
  orientation: DragOrientation;
  fromIndex: number;
  toIndex: number;
}

interface TableNodeInfo {
  tableNode: ProseMirrorNode;
  tablePos: number;
}

@Component({
  selector: 'ins-table-handle',
  templateUrl: './table-handle.html',
  styleUrl: './table-handle.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.visible]': 'visible()',
    // '[class.dragging]': 'isDragging()',
  },
})
export class InsTableHandle implements OnInit {
  private editorInstance: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  private readonly destroyRef = inject(DestroyRef);
  private readonly editor$ = new BehaviorSubject(this.editorInstance);

  private activeTable: HTMLTableElement | null = null;

  private activeRowIndex: number | null = null;

  private activeColIndex: number | null = null;

  private dragState: DragState | null = null;

  protected readonly visible = signal(false);

  protected readonly rowTop = signal(0);

  protected readonly rowLeft = signal(0);

  protected readonly colTop = signal(0);

  protected readonly colLeft = signal(0);

  protected readonly dropIndicatorTop = signal(0);

  protected readonly dropIndicatorLeft = signal(0);

  protected readonly dropIndicatorWidth = signal(0);

  protected readonly dropIndicatorHeight = signal(0);

  protected readonly dropIndicatorVisible = signal(false);

  @ViewChild('rowDragHandleBtn', { static: true, read: ElementRef })
  private readonly rowDragHandleBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('colDragHandleBtn', { static: true, read: ElementRef })
  private readonly colDragHandleBtn!: ElementRef<HTMLButtonElement>;
  public activeNode$ = new BehaviorSubject<{ node: ProseMirrorNode | null; nodePos: number }>({
    node: null,
    nodePos: -1,
  });

  @Input()
  public set editor(editor: AbstractInsEditor | null) {
    this.editorInstance = editor;
    this.editor$.next(editor);
  }

  public get editor(): AbstractInsEditor | null {
    return this.editorInstance;
  }

  private get editorView(): EditorView | null {
    return this.editor?.view ?? null;
  }

  ngOnInit(): void {
    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) => {
          return editor
            ? editor.transactionChange$.pipe(
                startWith(null),
                auditTime(100),
                takeUntilDestroyed(this.destroyRef),
              )
            : of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.refreshActiveNode(this.editorView);
      });

    this.activeNode$
      .pipe(
        distinctUntilChanged((a, b) => {
          if (a.nodePos !== b.nodePos) return false;
          if (a.node === b.node) return true;
          if (!a.node || !b.node) return false;
          return a.node.eq(b.node);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ node, nodePos }) => {
        if (!node || nodePos < 0 || node.type.name !== 'tableCell') {
          this.hide();
          return;
        }

        const cell = this.getCellElementByPos(nodePos);
        if (!cell) {
          return;
        }

        this.updateActiveContext(cell);
      });
    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) => {
          return editor
            ? fromEvent<DragEvent>(this.rowDragHandleBtn.nativeElement, 'dragstart').pipe(
                switchMap((event) => {
                  this.onRowDragStart(event);
                  return race(
                    editor!.drop$.pipe(
                      take(1),
                      map(() => 'drop' as const),
                    ),
                    fromEvent<DragEvent>(this.rowDragHandleBtn.nativeElement, 'dragend').pipe(
                      take(1),
                      map(() => 'dragend' as const),
                    ),
                  );
                }),
                takeUntilDestroyed(this.destroyRef),
              )
            : of(null);
        }),
      )
      .subscribe((v) => {
        if (!v) return;
        this.handleDrop();
        this.onDragEnd();
      });
    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) => {
          return editor
            ? fromEvent<DragEvent>(this.colDragHandleBtn.nativeElement, 'dragstart').pipe(
                switchMap((event) => {
                  // this.positionSelectionSrv.onDragStart(event);
                  this.onColumnDragStart(event);
                  return race(
                    editor!.drop$.pipe(
                      take(1),
                      map(() => 'drop' as const),
                    ),
                    fromEvent<DragEvent>(this.colDragHandleBtn.nativeElement, 'dragend').pipe(
                      take(1),
                      map(() => 'dragend' as const),
                    ),
                  );
                }),
                takeUntilDestroyed(this.destroyRef),
              )
            : of(null);
        }),
      )
      .subscribe((v) => {
        if (!v) return;
        this.handleDrop();
        this.onDragEnd();
      });

    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) =>
          editor?.view ? fromEvent<DragEvent>(editor.view.root, 'dragover') : of(null),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (!event) {
          return;
        }
        this.handleDragOver(event);
      });
  }
  refreshActiveNode(view: EditorView | null) {
    if (!view) return;
    const selection = view.state.selection;
    if (!selection) return;
    let $pos = selection.$from;
    let node = null;
    let nodePos = -1;

    for (let d = $pos.depth; d > 0; d--) {
      const parent = $pos.node(d);
      const nodeName = parent.type.name;
      if (nodeName === 'tableCell') {
        node = parent;
        nodePos = $pos.before(d);
        break;
      }
    }
    this.activeNode$.next({ node, nodePos });
  }
  updateActiveContext(cell: HTMLTableCellElement | null) {
    if (!cell) return;
    const table = cell.closest('table');
    if (!(table instanceof HTMLTableElement)) {
      return;
    }
    this.activeTable = table;
    this.visible.set(true);

    const row = cell.parentElement;
    if (!(row instanceof HTMLTableRowElement)) {
      return;
    }
    this.activeRowIndex = Array.prototype.indexOf.call(
      row.parentElement?.children ?? [],
      row,
    ) as number;
    this.activeColIndex = Array.prototype.indexOf.call(row.children, cell) as number;

    this.updatePosition(cell);
  }
  updatePosition(cell: HTMLTableCellElement) {
    const view = this.editorView;
    if (!view) {
      return;
    }

    const container = view.dom.parentElement;
    if (!container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const cellRect = cell.getBoundingClientRect();

    this.rowTop.set(cellRect.top - containerRect.top + scrollTop + cellRect.height / 2);
    this.rowLeft.set(cellRect.left - containerRect.left + scrollLeft - 10);
    this.colTop.set(cellRect.top - containerRect.top + scrollTop - 10);
    this.colLeft.set(cellRect.left - containerRect.left + scrollLeft + cellRect.width / 2);
  }

  private getCellElementByPos(nodePos: number): HTMLTableCellElement | null {
    const dom = this.editorView?.nodeDOM(nodePos);

    if (dom instanceof HTMLTableCellElement) {
      return dom;
    }

    if (dom instanceof HTMLElement) {
      const cell = dom.closest('td, th');
      return cell instanceof HTMLTableCellElement ? cell : null;
    }

    return null;
  }
  protected onAddRow(event: MouseEvent): void {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }
    this.editor?.addRowAfter()
  }

  protected onRemoveRow(event: MouseEvent): void {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }
    this.editor?.deleteRow()
  }

  protected onAddColumn(event: MouseEvent): void {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }
    this.editor?.addColumnAfter()
  }

  protected onRemoveColumn(event: MouseEvent): void {
    event.preventDefault();
    if (!this.ensureCurrentCellSelection()) {
      return;
    }
    this.editor?.deleteColumn()
  }

  protected onRowDragStart(event: DragEvent): void {
    if (this.activeRowIndex === null || !this.activeTable) {
      event.preventDefault();
      return;
    }

    this.dragState = {
      orientation: 'row',
      fromIndex: this.activeRowIndex,
      toIndex: this.activeRowIndex,
    };
    // this.isDragging.set(true);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // event.dataTransfer.setData('text/plain', 'ins-table-row-handle');
    }
  }

  protected onColumnDragStart(event: DragEvent): void {
    if (this.activeColIndex === null || !this.activeTable) {
      event.preventDefault();
      return;
    }

    this.dragState = {
      orientation: 'column',
      fromIndex: this.activeColIndex,
      toIndex: this.activeColIndex,
    };
    // this.isDragging.set(true);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // event.dataTransfer.setData('text/plain', 'ins-table-row-handle');
    }
  }

  protected onDragEnd(): void {
    this.resetDraggingState();
  }

  protected onPanelMouseEnter(): void {
    this.visible.set(true);
  }

  private readonly handleDragOver = (event: DragEvent): void => {
    if (!this.dragState || !this.activeTable) {
      return;
    }

    const targetCell = this.getCellFromPoint(event.clientX, event.clientY);
    if (!targetCell || targetCell.closest('table') !== this.activeTable) {
      return;
    }

    event.preventDefault();
    // if (event.dataTransfer) {
    //   event.dataTransfer.dropEffect = 'move';
    // }

    const row = targetCell.parentElement;
    if (!(row instanceof HTMLTableRowElement)) {
      return;
    }

    const rowIndex = Array.prototype.indexOf.call(row.parentElement?.children ?? [], row) as number;
    const colIndex = Array.prototype.indexOf.call(row.children, targetCell) as number;

    if (rowIndex < 0 || colIndex < 0) {
      return;
    }

    this.dragState.toIndex = this.dragState.orientation === 'row' ? rowIndex : colIndex;
    this.updateDropIndicator(targetCell);
  };

  private readonly handleDrop = (): void => {
    if (!this.dragState) {
      return;
    }

    const dragState = this.dragState;
    this.resetDraggingState();

    if (dragState.fromIndex !== dragState.toIndex) {
      this.reorderTable(dragState);
    }
  };

  private hide(): void {
    if (this.dragState) {
      return;
    }
    this.visible.set(false);
    this.activeTable = null;
    this.activeRowIndex = null;
    this.activeColIndex = null;
    this.dropIndicatorVisible.set(false);
  }

  private ensureCurrentCellSelection(): boolean {
    if (this.activeRowIndex === null || this.activeColIndex === null || !this.editorView) {
      return false;
    }

    const tableInfo = this.getCurrentTableInfo();
    if (!tableInfo) {
      return false;
    }

    const anchor = this.getCellPos(
      tableInfo.tableNode,
      tableInfo.tablePos,
      this.activeRowIndex,
      this.activeColIndex,
    );
    if (anchor === null) {
      return false;
    }

    this.editorView.dispatch(
      this.editorView.state.tr.setSelection(
        CellSelection.create(this.editorView.state.doc, anchor, anchor),
      ),
    );
    return true;
  }

  private getCurrentTableInfo(): TableNodeInfo | null {
    if (!this.activeTable || !this.editorView) {
      return null;
    }

    const firstCell = this.activeTable.querySelector('td, th');
    if (!(firstCell instanceof HTMLTableCellElement)) {
      return null;
    }

    const cellPos = this.editorView.posAtDOM(firstCell, 0) - 1;
    const resolvedPos = this.editorView.state.doc.resolve(Math.max(cellPos, 0));

    for (let depth = resolvedPos.depth; depth > 0; depth -= 1) {
      const node = resolvedPos.node(depth);
      if (node.type.name === 'table') {
        return { tableNode: node, tablePos: resolvedPos.before(depth) };
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

  private getCellFromPoint(x: number, y: number): HTMLTableCellElement | null {
    const root = this.editorView?.root;
    if (!root || !('elementsFromPoint' in root)) {
      return null;
    }

    const elements = root.elementsFromPoint(x, y);
    for (const element of elements) {
      if (element instanceof HTMLTableCellElement) {
        return element;
      }
      if (element instanceof HTMLElement) {
        const cell = element.closest('td, th');
        if (cell instanceof HTMLTableCellElement) {
          return cell;
        }
      }
    }

    return null;
  }

  private updateDropIndicator(targetCell: HTMLTableCellElement): void {
    const view = this.editorView;
    const table = this.activeTable;
    if (!this.dragState || !view || !table) {
      return;
    }

    const container = view.dom.parentElement;
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const tableRect = table.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();

    if (this.dragState.orientation === 'row') {
      this.dropIndicatorLeft.set(tableRect.left - containerRect.left + scrollLeft);
      this.dropIndicatorTop.set(cellRect.top - containerRect.top + scrollTop);
      this.dropIndicatorWidth.set(tableRect.width);
      this.dropIndicatorHeight.set(2);
    } else {
      this.dropIndicatorLeft.set(cellRect.left - containerRect.left + scrollLeft);
      this.dropIndicatorTop.set(tableRect.top - containerRect.top + scrollTop);
      this.dropIndicatorWidth.set(2);
      this.dropIndicatorHeight.set(tableRect.height);
    }

    this.dropIndicatorVisible.set(true);
    console.log('upload line');
  }

  private resetDraggingState(): void {
    this.dragState = null;
    // this.isDragging.set(false);
    this.dropIndicatorVisible.set(false);
  }

  private reorderTable(dragState: DragState): void {
    const view = this.editorView;
    const tableInfo = this.getCurrentTableInfo();
    if (!view || !tableInfo) {
      return;
    }

    const { tableNode, tablePos } = tableInfo;
    if (dragState.orientation === 'row') {
      const rows = Array.from({ length: tableNode.childCount }, (_, index) =>
        tableNode.child(index),
      );
      const movedRow = rows.splice(dragState.fromIndex, 1)[0];
      if (!movedRow) {
        return;
      }
      rows.splice(dragState.toIndex, 0, movedRow);
      const newTable = tableNode.type.create(tableNode.attrs, rows, tableNode.marks);
      view.dispatch(view.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable));
      return;
    }

    if (!this.canReorderColumns(tableNode)) {
      return;
    }

    const rows = Array.from({ length: tableNode.childCount }, (_, rowIndex) => {
      const row = tableNode.child(rowIndex);
      const cells = Array.from({ length: row.childCount }, (_, colIndex) => row.child(colIndex));
      const movedCell = cells.splice(dragState.fromIndex, 1)[0];
      if (!movedCell) {
        return row;
      }
      cells.splice(dragState.toIndex, 0, movedCell);
      return row.type.create(row.attrs, cells, row.marks);
    });

    const newTable = tableNode.type.create(tableNode.attrs, rows, tableNode.marks);
    view.dispatch(view.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable));
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
        const attrs = row.child(colIndex).attrs as Record<string, unknown>;
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
