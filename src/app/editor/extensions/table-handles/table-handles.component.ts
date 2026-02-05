import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
  effect,
  untracked,
  ViewEncapsulation,
  NgZone,
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
  TableMap,
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
  templateUrl: './table-handles.component.html',
  styleUrls: ['./table-handles.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class InsTableHandles extends AngularNodeViewComponent implements OnInit, OnDestroy, AfterViewInit {
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
  private readonly ngZone = inject(NgZone);
  protected readonly icons = inject<any>(INS_EDITOR_OPTIONS).icons;

  constructor() {
    super();
    effect(() => {
      const node = this.node();
      untracked(() => {
        this.updateColumns(node);
      });
    });
  }

  ngOnInit() {
    //
  }

  ngAfterViewInit() {
    this.updateColumns(this.node());
    
    this.ngZone.runOutsideAngular(() => {
      this.tableRef.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    });
  }

  ngOnDestroy() {
    this.tableRef.nativeElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggingState) return;

    const target = event.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;

    if (!cell) {
      return;
    }

    // Ensure the cell belongs to this table
    if (cell.closest('table') !== this.tableRef.nativeElement) return;

    const { state, view } = this.editor();
    const pos = this.getPos()?.();
    if (typeof pos !== 'number') return;
    const tableNode = state.doc.nodeAt(pos);
    if (!tableNode) return;

    const cellPos = view.posAtDOM(cell, 0);
    const map = TableMap.get(tableNode);
    
    try {
      const cellRect = map.findCell(cellPos - pos - 2);
      const colIndex = cellRect.left;
      const rowIndex = cellRect.top;

      if (this.hoveredRow !== rowIndex || this.hoveredCol !== colIndex) {
        this.ngZone.run(() => {
            this.hoveredRow = rowIndex;
            this.hoveredCol = colIndex;
            this.updateHandlePositions(cell, (cell.parentElement as HTMLTableRowElement));
            this.cdr.markForCheck();
        });
      }
    } catch (e) {
      console.warn('Table handle mousemove error:', e);
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

    // Ensure the cell belongs to this table
    if (cell.closest('table') !== this.tableRef.nativeElement) {
      this.dropIndicator = null;
      this.dropIndex = null;
      return;
    }

    const { state, view } = this.editor();
    const pos = this.getPos()?.();
    if (typeof pos !== 'number') return;
    const tableNode = state.doc.nodeAt(pos);
    if (!tableNode) return;

    const cellPos = view.posAtDOM(cell, 0);
    const map = TableMap.get(tableNode);
    let cellRect;
    try {
      cellRect = map.findCell(cellPos - pos - 2);
    } catch (e) {
      console.warn('Table handle dragover error:', e);
      this.dropIndicator = null;
      this.dropIndex = null;
      return;
    }

    const rowIndex = cellRect.top;
    const colIndex = cellRect.left;

    const row = cell.parentElement as HTMLTableRowElement;
    const wrapperRect = this.wrapper.nativeElement.getBoundingClientRect();

    if (this.draggingState.type === 'row') {
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
      const cellRectDOM = cell.getBoundingClientRect();

      const isAfter = colIndex > this.draggingState.index;
      this.dropIndex = colIndex + (isAfter ? 1 : 0);

      const left = isAfter
        ? cellRectDOM.right - wrapperRect.left - 2
        : cellRectDOM.left - wrapperRect.left - 2;

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

    const map = TableMap.get(tableNode);
    const rows: PMNode[] = [];

    // Check if we can move this column
    // For simplicity, we only allow moving columns if:
    // 1. The 'from' column doesn't contain any merged cells that start before the column or span across it in a complex way.
    // Basically, all cells in 'from' column must have colspan=1.
    for (let r = 0; r < tableNode.childCount; r++) {
      const index = map.map[r * map.width + from];
      // If this cell starts before 'from' column, we can't move 'from' column independently.
      const cellRect = map.findCell(index);
      if (cellRect.left < from) {
        console.warn('Cannot move column due to merged cells');
        return;
      }
      // If this cell spans more than 1 column, we can't move just this column.
      if (cellRect.right > from + 1) {
           console.warn('Cannot move column with colspan > 1');
           return;
      }
    }

    // Iterate over each row and reconstruct it
    for (let r = 0; r < tableNode.childCount; r++) {
      const row = tableNode.child(r);

      // We need to iterate the ORIGINAL cells and decide where they go.
      // Since we verified that 'from' column consists of single-column cells,
      // we can safely extract them.

      const originalCells: PMNode[] = [];
      row.content.forEach(c => originalCells.push(c));

      // We need to map visual index 'from' to child index in this row.
      // Since all previous cells might have colspan, we sum them up.
      let domIndexFrom = -1;
      let currentCol = 0;
      for (let i = 0; i < originalCells.length; i++) {
        if (currentCol === from) {
            domIndexFrom = i;
            break;
        }
        currentCol += (originalCells[i].attrs['colspan'] || 1);
      }

      // Calculate insertion point for 'to'
      // This is tricky because 'to' is a visual index.
      let domIndexTo = 0;
      currentCol = 0;
      for (let i = 0; i < originalCells.length; i++) {
         if (currentCol >= to) {
             break;
         }
         domIndexTo = i + 1; // Default to after
         currentCol += (originalCells[i].attrs['colspan'] || 1);
      }

      if (domIndexFrom !== -1) {
          const [cell] = originalCells.splice(domIndexFrom, 1);

          // Re-scan to find 'to' position after removal
          let currentC = 0;
          let insertIndex = 0;
          for (let i = 0; i < originalCells.length; i++) {
             if (currentC >= (to > from ? to - 1 : to)) {
                 break;
             }
             insertIndex++;
             currentC += (originalCells[i].attrs['colspan'] || 1);
          }

          originalCells.splice(insertIndex, 0, cell);
      }

      rows.push(row.type.create(row.attrs, Fragment.from(originalCells)));
    }

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
    this.colDropdownOpen.set(!this.colDropdownOpen())
  }

  selectRow(rowIndex: number) {
    this.setSelection(rowIndex, 0);
    this.rowDropdownOpen.set(!this.rowDropdownOpen())
  }

  addColBefore(colIndex: number) {
    this.setSelection(this.hoveredRow || 0, colIndex);
    this.runCommand(addColumnBefore);
    this.colDropdownOpen.set(false);
    this.hoveredRow = null;
    this.hoveredCol = null;
  }

  addColAfter(colIndex: number) {
    this.setSelection(this.hoveredRow || 0, colIndex);
    this.runCommand(addColumnAfter);
    this.colDropdownOpen.set(false);
    this.hoveredRow = null;
    this.hoveredCol = null;
  }

  deleteCol(colIndex: number) {
    this.setSelection(this.hoveredRow || 0, colIndex);
    this.runCommand(deleteColumn);
    this.onMouseLeave();
    this.colDropdownOpen.set(false);
  }

  addRowBefore(rowIndex: number) {
    this.setSelection(rowIndex, this.hoveredCol || 0);
    this.runCommand(addRowBefore);
    this.rowDropdownOpen.set(false);
    this.hoveredRow = null;
    this.hoveredCol = null;
  }

  addRowAfter(rowIndex: number) {
    this.setSelection(rowIndex, this.hoveredCol || 0);
    this.runCommand(addRowAfter);
    this.rowDropdownOpen.set(false);
    this.hoveredRow = null;
    this.hoveredCol = null;
  }

  deleteRow(rowIndex: number) {
    this.setSelection(rowIndex, this.hoveredCol || 0);
    this.runCommand(deleteRow);
    this.onMouseLeave();
    this.rowDropdownOpen.set(false);
  }

  private updateColumns(node: PMNode) {
    if (!this.tableRef?.nativeElement) return;
    const table = this.tableRef.nativeElement;

    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }

    const firstRow = node.firstChild;
    if (!firstRow) return;

    let totalWidth = 0;
    const cols: string[] = [];

    firstRow.content.forEach((cell) => {
      const { colspan, colwidth } = cell.attrs;
      for (let i = 0; i < (colspan || 1); i++) {
        const hasWidth = colwidth && colwidth[i];
        const cssWidth = hasWidth ? hasWidth + 'px' : '';
        totalWidth += hasWidth || 0;
        cols.push(cssWidth);
      }
    });

    let output = '';
    cols.forEach((w) => {
      output += `<col${w ? ` style="width: ${w}"` : ''} />`;
    });
    
    if (colgroup.innerHTML !== output) {
       colgroup.innerHTML = output;
    }
  }
}
