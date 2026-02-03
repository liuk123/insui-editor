import {ChangeDetectionStrategy, Component, forwardRef, inject, TemplateRef, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { getViewportWidth, InsDropdownDirective, InsDropdownOpen, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent, WINDOW } from '@liuk123/insui';

const MAX_COLS_NUMBER = 15;
const MAX_ROWS_NUMBER = 15;
const MIN_DISTANCE_PX = 70;

@Component({
    standalone: true,
    selector: 'button[insInsertTableTool]',
    imports: [InsTextfield],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <div class="t-size-selector">
                @for (item of columnsNumber; let colIndex = $index; track colIndex) {
                  <div class="t-column">
                    @for (item of rowsNumber; let rowIndex = $index; track rowIndex) {
                    <div
                        class="t-cell"
                        [class.t-cell_hovered]="tableSelectHovered(rowIndex, colIndex)"
                        (click)="addTable(tableSize)"
                        (mouseenter)="updateCurrentSize(rowIndex + 1, colIndex + 1, $event)"
                    ></div>
                    }
                  </div>
                }
                <div class="t-description">
                    {{ tableSize.cols }}&#215;{{ tableSize.rows }}
                </div>
            </div>
        </ng-container>
    `,
    styles: [
        `
            .t-size-selector {
                display: block;
                padding: 0.75rem;
            }

            .t-cell {
                display: inline-block;
                background-color: var(--ins-background-base);
                inline-size: 1.25rem;
                block-size: 1.25rem;
                border-radius: 0.25rem;
                margin: 0.125rem;
                border: 0.0625rem solid var(--ins-border-normal);
                cursor: pointer;
            }

            .t-cell_hovered {
                background-color: var(--ins-background-base-alt);
            }

            .t-column {
                white-space: nowrap;
            }

            .t-description {
                text-align: center;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        '[attr.automation-id]': '"toolbar__insert-table-button"',
    },
})
export class InsInsertTableButtonTool extends InsToolbarTool {
    private readonly win = inject(WINDOW);
  private readonly dropdown = inject(InsDropdownDirective)
  // protected readonly open = inject(InsDropdownOpen);

    protected tableSize = {
        rows: 1,
        cols: 1,
    };

    private _currentTemplate: PolymorpheusContent | null = null;

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        if (template === this._currentTemplate) {
            return;
        }
        this._currentTemplate = template;
        this.dropdown.insDropdown = template;
    }

    protected get columnsNumber(): number[] {
        return new Array(Math.min(Math.max(3, this.tableSize.cols + 1), MAX_COLS_NUMBER));
    }

    protected get rowsNumber(): number[] {
        return new Array(Math.min(Math.max(3, this.tableSize.rows + 1), MAX_ROWS_NUMBER));
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.insertTable;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        // return this.open.insDropdownOpen() ? '' : (texts?.insertTable ?? '');
        return texts?.insertTable ?? ''
    }

    protected addTable({rows, cols}: {cols: number; rows: number}): void {
        this.editor?.enter(); // @note: clear previous styles

        const prevLine = this.editor?.state?.selection.anchor;

        // @note: don't use `setHardBreak`,
        // it inherits styles of previous lines
        // required two line after
        this.editor?.enter();
        this.editor?.enter();

        this.editor?.setTextSelection(prevLine ?? 0);
        this.editor?.insertTable(rows, cols);
    }

    protected tableSelectHovered(x: number, y: number): boolean {
        return x < this.tableSize.rows && y < this.tableSize.cols;
    }

    protected updateCurrentSize(rows: number, cols: number, event: MouseEvent): void {
        if (getViewportWidth(this.win) - event.clientX > MIN_DISTANCE_PX) {
            this.tableSize = {rows, cols};
            this.cd.detectChanges();
        }
    }
}
