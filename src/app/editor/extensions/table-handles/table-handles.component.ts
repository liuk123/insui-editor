import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { AngularNodeViewComponent } from '../tiptap-node-view';
import { CommonModule } from '@angular/common';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
} from 'prosemirror-tables';
import { TextSelection } from '@tiptap/pm/state';
import { Fragment, Node as PMNode } from '@tiptap/pm/model';
import { InsButton, insButtonOptionsProvider, InsDropdown } from "@liuk123/insui";
import { INS_EDITOR_DEFAULT_OPTIONS, INS_EDITOR_OPTIONS, InsEditorOptions } from '../../common/editor-options';

interface DraggingState {
  type: 'row' | 'col';
  index: number; // Original index
  mouseStart: number;
}

interface DropIndicator {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'ins-table-handles',
  standalone: true,
  imports: [CommonModule, InsDropdown, InsButton],
  providers: [
    // insButtonOptionsProvider({
    //     size: 's',
    //     appearance: 'icon',
    // }),
  ],
  template: `
    <div
      class="table-wrapper"
      #wrapper
      (mouseleave)="onMouseLeave()"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
      <!-- Drop Indicator -->
      @if (dropIndicator) {
        <div
          class="drop-indicator"
          [style.top.px]="dropIndicator.top"
          [style.left.px]="dropIndicator.left"
          [style.width.px]="dropIndicator.width"
          [style.height.px]="dropIndicator.height"
        ></div>
      }

      <!-- Column Handle -->

          <!-- [style.width.px]="colHandleWidth" -->
      <!-- @if (hoveredCol !== null) { -->
        <div
          class="table-handle col-handle"
          [style.left.px]="colHandleLeft"
          [insDropdown]="colHandleTemplate"
          [(insDropdownOpen)]='colDropdownOpen'
        >
          <button
            insIconButton
            appearance='icon'
            draggable="true"
            (dragstart)="onDragStart($event, 'col', hoveredCol!)"
            (click)="selectCol(hoveredCol!)"
            [iconStart]="icons.dragHandle"
          >
          </button>

        </div>
      <!-- } -->
      <ng-template #colHandleTemplate>
        <button insIconButton appearance='icon' (click)="addColBefore(hoveredCol!)">+</button>
        <button insIconButton appearance='icon' (click)="addColAfter(hoveredCol!)">+</button>
        <button insIconButton appearance='icon' (click)="deleteCol(hoveredCol!)">×</button>
      </ng-template>

      <!-- Row Handle -->

          <!-- [style.height.px]="rowHandleHeight" -->
      <!-- @if (hoveredRow !== null) { -->
        <div
          class="table-handle row-handle"
          [style.top.px]="rowHandleTop"
          [insDropdown]="rowHandleTemplate"
          [(insDropdownOpen)]='rowDropdownOpen'
        >
          <button
            draggable="true"
            insIconButton
            appearance='icon'
            (dragstart)="onDragStart($event, 'row', hoveredRow!)"
            (click)="selectRow(hoveredRow!)"
            [iconStart]="icons.dragHandle"
          >
          </button>

        </div>
      <!-- } -->
      <ng-template #rowHandleTemplate>
        <button insIconButton appearance='icon' (click)="addRowBefore(hoveredRow!)">+</button>
        <button insIconButton appearance='icon' (click)="addRowAfter(hoveredRow!)">+</button>
        <button insIconButton appearance='icon' (click)="deleteRow(hoveredRow!)">×</button>
      </ng-template>
      <!-- The Table Content -->
      <table #tableRef (mousemove)="onMouseMove($event)" data-node-view-content></table>
    </div>
  `,
  styles: [
    `
      .table-wrapper {
        position: relative;
        display: inline-block;
        margin-top: 20px;
        margin-left: 20px;
      }

      .drop-indicator {
        position: absolute;
        background-color: #3b82f6;
        pointer-events: none;
        z-index: 20;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      .table-handle {
        position: absolute;
        z-index: 10;
        pointer-events: auto;
        padding: 10px;
        border: 1px solid #ddd;
      }

      .col-handle {
        top: -1.5rem;
        width: 2rem;
        height: 2rem;
      }

      .row-handle {
        left: -1.5rem;
        width: 2rem;
        height: 2rem;
      }

      // .handle-button {
      //   cursor: grab;
      //   padding: 2px;
      //   font-size: 10px;
      //   flex: 1;
      //   display: flex;
      //   align-items: center;
      //   justify-content: center;
      // }

      // .handle-button:hover {
      //   background-color: #e0e0e0;
      // }

      // .handle-button:active {
      //   cursor: grabbing;
      // }

      // .add-button,
      // .remove-button {
      //   width: 16px;
      //   height: 16px;
      //   font-size: 12px;
      //   cursor: pointer;
      //   display: flex;
      //   align-items: center;
      //   justify-content: center;
      //   border-radius: 50%;
      //   margin: 1px;
      // }

      // .add-button:hover {
      //   background-color: #d0ffd0;
      // }

      // .remove-button:hover {
      //   background-color: #ffd0d0;
      // }

      // .drag-handle {
      //   color: #888;
      //   font-weight: bold;
      // }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsTableHandles extends AngularNodeViewComponent implements OnInit, OnDestroy {
  @ViewChild('wrapper', { static: true }) wrapper!: ElementRef<HTMLElement>;
  @ViewChild('tableRef', { static: true }) tableRef!: ElementRef<HTMLTableElement>;

  hoveredRow: number | null = null;
  hoveredCol: number | null = null;

  colHandleLeft = 0;
  colHandleWidth = 0;
  rowHandleTop = 0;
  rowHandleHeight = 0;
  readonly rowDropdownOpen = signal(true);
  readonly colDropdownOpen = signal(false);

  draggingState: DraggingState | null = null;
  dropIndicator: DropIndicator | null = null;
  dropIndex: number | null = null;

  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly icons = inject<any>(INS_EDITOR_OPTIONS).icons;

  ngOnInit() {
    //
  }

  ngOnDestroy() {
    //
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggingState) return;

    const target = event.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;

    if (!cell) {
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement;
    const tbody = row.parentElement as HTMLTableSectionElement;

    // Note: This is DOM index. For complex tables with colspan/rowspan, this might be inaccurate.
    const rowIndex = Array.from(tbody.children).indexOf(row);
    const colIndex = Array.from(row.children).indexOf(cell);

    if (this.hoveredRow !== rowIndex || this.hoveredCol !== colIndex) {
      this.hoveredRow = rowIndex;
      this.hoveredCol = colIndex;
      this.updateHandlePositions(cell, row);
      this.cdr.detectChanges();
    }
  }

  onMouseLeave() {
    if (this.draggingState) return;
    this.hoveredRow = null;
    this.hoveredCol = null;
    this.cdr.detectChanges();
  }

  updateHandlePositions(cell: HTMLTableCellElement, row: HTMLTableRowElement) {
    const wrapperRect = this.wrapper.nativeElement.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    this.colHandleLeft = cellRect.left - wrapperRect.left;
    this.colHandleWidth = cellRect.width;

    this.rowHandleTop = rowRect.top - wrapperRect.top;
    this.rowHandleHeight = rowRect.height;
  }

  // --- Drag & Drop ---

  onDragStart(event: DragEvent, type: 'row' | 'col', index: number) {
    this.draggingState = {
      type,
      index,
      mouseStart: type === 'row' ? event.clientY : event.clientX,
    };

    // Set drag image to transparent
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer?.setDragImage(img, 0, 0);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    if (!this.draggingState) return;
    event.preventDefault(); // Allow drop

    const target = event.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;

    if (!cell) {
      this.dropIndicator = null;
      this.dropIndex = null;
      this.cdr.detectChanges();
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement;
    const tbody = row.parentElement as HTMLTableSectionElement;
    const wrapperRect = this.wrapper.nativeElement.getBoundingClientRect();

    if (this.draggingState.type === 'row') {
      const rowIndex = Array.from(tbody.children).indexOf(row);
      const rowRect = row.getBoundingClientRect();

      this.dropIndex = rowIndex;

      const isAfter = this.dropIndex > this.draggingState.index;
      const top = isAfter
        ? rowRect.bottom - wrapperRect.top - 2
        : rowRect.top - wrapperRect.top - 2;

      this.dropIndicator = {
        left: 0,
        width: wrapperRect.width,
        top: top,
        height: 4,
      };
    } else {
      const colIndex = Array.from(row.children).indexOf(cell);
      const cellRect = cell.getBoundingClientRect();

      this.dropIndex = colIndex;

      const isAfter = this.dropIndex > this.draggingState.index;
      const left = isAfter
        ? cellRect.right - wrapperRect.left - 2
        : cellRect.left - wrapperRect.left - 2;

      const tableHeight = this.tableRef.nativeElement.getBoundingClientRect().height;

      this.dropIndicator = {
        left: left,
        width: 4,
        top: 0,
        height: tableHeight,
      };
    }

    this.cdr.detectChanges();
  }

  onDrop(event: DragEvent) {
    if (!this.draggingState || this.dropIndex === null) return;
    event.preventDefault();

    if (this.draggingState.index !== this.dropIndex) {
      if (this.draggingState.type === 'row') {
        this.reorderRows(this.draggingState.index, this.dropIndex);
      } else {
        this.reorderColumns(this.draggingState.index, this.dropIndex);
      }
    }

    this.draggingState = null;
    this.dropIndicator = null;
    this.dropIndex = null;
    this.cdr.detectChanges();
  }

  private reorderRows(from: number, to: number) {
    const { state, view } = this.editor();
    const pos = this.getPos()?.();
    if (typeof pos !== 'number') return;
    const tableNode = state.doc.nodeAt(pos);
    if (!tableNode) return;

    const rows: PMNode[] = [];
    for (let i = 0; i < tableNode.childCount; i++) {
      rows.push(tableNode.child(i));
    }

    const [row] = rows.splice(from, 1);
    rows.splice(to, 0, row);

    const newTable = tableNode.type.create(tableNode.attrs, Fragment.from(rows));
    const tr = state.tr.replaceWith(pos, pos + tableNode.nodeSize, newTable);
    view.dispatch(tr);
    view.focus();
  }

  private reorderColumns(from: number, to: number) {
    const { state, view } = this.editor();
    const pos = this.getPos()?.();
    if (typeof pos !== 'number') return;
    const tableNode = state.doc.nodeAt(pos);
    if (!tableNode) return;

    const rows: PMNode[] = [];

    // Iterate over each row and move the cell
    tableNode.content.forEach((row) => {
      const cells: PMNode[] = [];
      row.content.forEach((cell) => {
        cells.push(cell);
      });

      if (from < cells.length && to <= cells.length) {
        const [cell] = cells.splice(from, 1);
        cells.splice(to, 0, cell);
      }

      rows.push(row.type.create(row.attrs, Fragment.from(cells)));
    });

    // Handle column widths if they exist in attrs
    // (Simplification: assuming standard tables for now)

    const newTable = tableNode.type.create(tableNode.attrs, Fragment.from(rows));
    const tr = state.tr.replaceWith(pos, pos + tableNode.nodeSize, newTable);
    view.dispatch(tr);
    view.focus();
  }

  // --- Commands ---

  private runCommand(fn: (state: any, dispatch: any) => boolean) {
    this.editor().view.focus();
    fn(this.editor().state, this.editor().view.dispatch);
  }

  private setSelection(row: number, col: number) {
    const { state, view } = this.editor();
    const tr = state.tr;

    // We can use the cell DOM to find the position
    const cellDOM = this.tableRef.nativeElement.rows[row]?.cells[col];
    if (!cellDOM) return;

    const pos = view.posAtDOM(cellDOM, 0);
    tr.setSelection(TextSelection.create(state.doc, pos + 1));
    view.dispatch(tr);
  }

  selectCol(colIndex: number) {
    this.setSelection(0, colIndex);
    // Note: Real column selection usually requires prosemirror-tables utils or CellSelection
  }

  selectRow(rowIndex: number) {
    this.setSelection(rowIndex, 0);
  }

  addColBefore(colIndex: number) {
    this.setSelection(this.hoveredRow || 0, colIndex);
    this.runCommand(addColumnBefore);
  }

  addColAfter(colIndex: number) {
    this.setSelection(this.hoveredRow || 0, colIndex);
    this.runCommand(addColumnAfter);
  }

  deleteCol(colIndex: number) {
    this.setSelection(this.hoveredRow || 0, colIndex);
    this.runCommand(deleteColumn);
    this.onMouseLeave();
  }

  addRowBefore(rowIndex: number) {
    this.setSelection(rowIndex, this.hoveredCol || 0);
    this.runCommand(addRowBefore);
  }

  addRowAfter(rowIndex: number) {
    this.setSelection(rowIndex, this.hoveredCol || 0);
    this.runCommand(addRowAfter);
  }

  deleteRow(rowIndex: number) {
    this.setSelection(rowIndex, this.hoveredCol || 0);
    this.runCommand(deleteRow);
    this.onMouseLeave();
  }
}
