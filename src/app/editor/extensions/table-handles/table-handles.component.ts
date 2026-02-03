import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject,
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

@Component({
  selector: 'ins-table-handles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper" #wrapper (mouseleave)="onMouseLeave()">
      <!-- Column Handle -->
      <div
        class="table-handle col-handle"
        *ngIf="hoveredCol !== null"
        [style.left.px]="colHandleLeft"
        [style.width.px]="colHandleWidth"
      >
        <div class="handle-button" (click)="selectCol(hoveredCol!)">
          <span class="drag-handle">::</span>
        </div>
        <div class="add-button add-before" (click)="addColBefore(hoveredCol!)">+</div>
        <div class="add-button add-after" (click)="addColAfter(hoveredCol!)">+</div>
        <div class="remove-button" (click)="deleteCol(hoveredCol!)">×</div>
      </div>

      <!-- Row Handle -->
      <div
        class="table-handle row-handle"
        *ngIf="hoveredRow !== null"
        [style.top.px]="rowHandleTop"
        [style.height.px]="rowHandleHeight"
      >
        <div class="handle-button" (click)="selectRow(hoveredRow!)">
          <span class="drag-handle">::</span>
        </div>
        <div class="add-button add-before" (click)="addRowBefore(hoveredRow!)">+</div>
        <div class="add-button add-after" (click)="addRowAfter(hoveredRow!)">+</div>
        <div class="remove-button" (click)="deleteRow(hoveredRow!)">×</div>
      </div>

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

      table {
        border-collapse: collapse;
        width: 100%;
      }

      .table-handle {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        z-index: 10;
        pointer-events: auto;
      }

      .col-handle {
        top: -12px;
        height: 24px;
        flex-direction: row;
      }

      .row-handle {
        left: -12px;
        width: 24px;
        flex-direction: column;
      }

      .handle-button {
        cursor: grab;
        padding: 2px;
        font-size: 10px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .handle-button:hover {
        background-color: #e0e0e0;
      }

      .add-button,
      .remove-button {
        width: 16px;
        height: 16px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin: 1px;
      }

      .add-button:hover {
        background-color: #d0ffd0;
      }

      .remove-button:hover {
        background-color: #ffd0d0;
      }

      .drag-handle {
        color: #888;
        font-weight: bold;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsTableHandles extends AngularNodeViewComponent {
  @ViewChild('wrapper', { static: true }) wrapper!: ElementRef<HTMLElement>;
  @ViewChild('tableRef', { static: true }) tableRef!: ElementRef<HTMLTableElement>;

  hoveredRow: number | null = null;
  hoveredCol: number | null = null;

  colHandleLeft = 0;
  colHandleWidth = 0;
  rowHandleTop = 0;
  rowHandleHeight = 0;

  private readonly cdr = inject(ChangeDetectorRef);

  onMouseMove(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;

    if (!cell) {
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement;
    const tbody = row.parentElement as HTMLTableSectionElement;

    // Calculate indices
    // Note: This is DOM index. For complex tables with colspan/rowspan, this might be inaccurate for model operations.
    // But for basic tables it works. Prosemirror-tables handles the model operations.
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

  // Commands

  private runCommand(fn: (state: any, dispatch: any) => boolean) {
    this.editor().view.focus();
    fn(this.editor().state, this.editor().view.dispatch);
  }

  // We need to set selection to the specific cell before running commands
  // because prosemirror-tables commands act on selection.
  private setSelection(row: number, col: number) {
    const { state, view } = this.editor();
    const tr = state.tr;
    const tablePos = this.getPos();

    if (typeof tablePos !== 'number') return;

    // Resolve position of the table
    const tableResolved = state.doc.resolve(tablePos + 1);

    // This is complex because we need to map DOM row/col to model positions.
    // For simplicity, we'll assume a basic grid for now.
    // Or we can use CellSelection.create if we have the resolved positions.

    // Let's try to find the cell node position.
    // We can use the view.posAtDOM method?
    // Or we can rely on the fact that we have the cell DOM element.

    const cellDOM = this.tableRef.nativeElement.rows[row].cells[col];
    if (!cellDOM) return;

    const pos = view.posAtDOM(cellDOM, 0);
    const $pos = state.doc.resolve(pos);

    // Create a CellSelection
    // We need to import CellSelection from prosemirror-tables
    // But CellSelection constructor is not always public API in all versions?
    // It is exported.

    // However, standard text selection inside the cell is enough for some commands.
    tr.setSelection(TextSelection.create(state.doc, pos + 1));
    view.dispatch(tr);
  }

  selectCol(colIndex: number) {
    // Implementation of column selection
    // We need to select all cells in the column.
    this.setSelection(0, colIndex); // Select top cell
    this.runCommand((state, dispatch) => {
      // We can use addColumnAfter etc. but to SELECT, we need CellSelection.colSelection
      // But prosemirror-tables helper for that is not straightforward exposed as a command?
      // Actually, clicking the handle usually selects the column.
      // We can simulate it by creating a CellSelection.

      // For now, let's just focus on add/remove.
      return false;
    });

    // To select a column, we can try to use the `decorations` approach from BlockNote,
    // or just construct a CellSelection.
    const { state, view } = this.editor();
    const tablePos = this.getPos();
    if (typeof tablePos !== 'number') return;

    const map = (window as any).prosemirror_tables?.TableMap?.get(this.node());
    if (!map) return; // Need TableMap

    // If we can't easily select, we skip for now.
  }

  selectRow(rowIndex: number) {
    // Similar to selectCol
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
    this.onMouseLeave(); // Hide handles
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
