import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  InsDropdownDirective,
  insDropdownOptionsProvider,
  InsDropdownPositionSided,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

const MIN_COLUMNS_NUMBER = 2;
const MAX_COLUMNS_NUMBER = 6;

@Component({
  standalone: true,
  selector: 'button[insInsertColumnsLabel]',
  imports: [InsTextfield],
  template: `
    {{ insHint() }}

    <ng-container *insTextfieldDropdown>
      <div class="t-columns-selector">
        <div class="t-columns-grid">
          @for (count of columnCounts; track count) {
            <button
              type="button"
              class="t-columns-option"
              [class.t-columns-option_hovered]="columnsHovered(count)"
              (mouseenter)="selectedColumns = count"
              (click)="addColumns(count)"
            >
              <!-- @for (column of createColumnPreview(count); track $index) {
                <span class="t-columns-preview-cell"></span>
              } -->
            </button>
          }
        </div>
        <div class="t-columns-description">{{ selectedColumns }} 栏</div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .t-columns-selector {
        display: block;
        padding: 0.75rem;
        min-inline-size: 12rem;
      }

      .t-columns-grid {
        display: grid;
        grid-auto-flow: column;
        height: 6rem;
        gap: 0.25rem;
      }

      .t-columns-option {
        border-radius: 0.5rem;
        border: 0.0625rem solid var(--ins-border-normal);
        background: var(--ins-background-base);
        cursor: pointer;
      }

      .t-columns-option_hovered {
        background: var(--ins-background-neutral-1-hover);
      }

      .t-columns-description {
        margin-top: 0.5rem;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    InsDropdownDirective,
    InsWithDropdownOpen,
    InsDropdownPositionSided,
  ],
  providers: [insDropdownOptionsProvider({ align: 'right' })],
})
export class InsInsertColumnsButtonLabel extends InsToolbarBase {
  private readonly dropdown = inject(InsDropdownDirective);

  protected selectedColumns = MIN_COLUMNS_NUMBER;
  protected readonly columnCounts = Array.from(
    { length: MAX_COLUMNS_NUMBER - MIN_COLUMNS_NUMBER + 1 },
    (_, index) => index + MIN_COLUMNS_NUMBER,
  );

  protected readonly templateRef = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected readonly bindDropdown = effect(() => {
    this.dropdown.insDropdown = this.templateRef();
  });

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.columns;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.insertColumns || '';
  }

  protected addColumns(count: number): void {
    this.editor?.setColumns(count);
  }
  protected columnsHovered(count: number): boolean {
    return count <= this.selectedColumns;
  }
}
