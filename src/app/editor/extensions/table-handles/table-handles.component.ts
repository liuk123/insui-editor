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
import { InsButton, InsDataList, InsDropdown, InsOption } from '@liuk123/insui';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';

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
  imports: [CommonModule, InsDropdown, InsButton, InsDataList, InsOption],
  providers: [],
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
      @if (hoveredCol !== null) {
        <div
          class="table-handle col-handle"
          [style.left.px]="colHandleLeft"
          [style.width.px]="colHandleWidth"
        >
          <button
            insIconButton
            appearance='icon'
            draggable="true"
            [insDropdown]="colHandleTemplate"
            [(insDropdownOpen)]="colDropdownOpen"
            (dragstart)="onDragStart($event, 'col', hoveredCol!)"
            (click)="selectCol(hoveredCol!)"
            [iconStart]="icons.dragHandle"
          >
          </button>
        </div>
      }

      <!-- Row Handle -->
      @if (hoveredRow !== null) {
        <div
          class="table-handle row-handle"
          [style.top.px]="rowHandleTop"
          [style.height.px]="rowHandleHeight"
        >
          <button
            draggable="true"
            insIconButton
            appearance='icon'
            [insDropdown]="rowHandleTemplate"
            [(insDropdownOpen)]="rowDropdownOpen"
            (dragstart)="onDragStart($event, 'row', hoveredRow!)"
            (click)="selectRow(hoveredRow!)"
            [iconStart]="icons.dragHandle"
          >
          </button>
        </div>
      }
      <!-- The Table Content -->
      <table #tableRef (mousemove)="onMouseMove($event)" data-node-view-content></table>

      <ng-template #colHandleTemplate>
        <ins-data-list>
          <button insOption (click)="addColBefore(hoveredCol!)">Add Column Before</button>
          <button insOption (click)="addColAfter(hoveredCol!)">Add Column After</button>
          <button insOption (click)="deleteCol(hoveredCol!)">Delete Column</button>
        </ins-data-list>
      </ng-template>

      <ng-template #rowHandleTemplate>
        <ins-data-list>
          <button insOption (click)="addRowBefore(hoveredRow!)">Add Row Before</button>
          <button insOption (click)="addRowAfter(hoveredRow!)">Add Row After</button>
          <button insOption (click)="deleteRow(hoveredRow!)">Delete Row</button>
        </ins-data-list>
      </ng-template>
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
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        z-index: 10;
        pointer-events: auto;
      }

      .col-handle {
        top: -1.5rem;
        width: 2rem;
        height: 1.5rem;
        flex-direction: row;
      }

      .row-handle {
        left: -1.5rem;
        width: 1.5rem;
        height: 2rem;
        flex-direction: column;
      }

      .drag-handle {
        color: #888;
        font-weight: bold;
        cursor: grab;
      }
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

  readonly rowDropdownOpen = signal(false);
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
    if (this.colDropdownOpen() || this.rowDropdownOpen()) return;
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
    this.colDropdownOpen.set(true)
  }

  selectRow(rowIndex: number) {
    this.setSelection(rowIndex, 0);
    this.rowDropdownOpen.set(true)
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
