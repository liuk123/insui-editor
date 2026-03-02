import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import {
  InsDropdownDirective,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
  InsButton,
  LOCAL_STORAGE,
  InsChevron,
} from '@liuk123/insui';
import { InsLanguageEditor } from '../../i18n/language';
import { InsPalette } from '../../components/palette/palette';
import { InsEditorOptions } from '../../common/editor-options';

@Component({
  standalone: true,
  selector: 'button[insHighlightColorTool]',
  imports: [InsTextfield, InsButton, InsPalette],
  template: `
    <ng-container *insTextfieldDropdown>
      <ins-palette [colors]="colors" (colorChange)="setBackgroundColor($event)"></ins-palette>
    </ng-container>
  `,
  styles: [
    `
      .highlight-color-item {
        height: 1rem;
        width: 0.5rem;
        border-radius: 0.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__hilite-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsHighlightColorButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);
  private localStorage = inject(LOCAL_STORAGE);

  @Input()
  public colors: ReadonlyMap<string, string> = this.options.backgroundColors ?? this.options.colors;

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  private e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.textHilite;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.backColor ?? '';
  }

  protected setBackgroundColor(color: string): void {
    this.localStorage.setItem('ins-local-hilite-color', color);
    this.editor?.setBackgroundColor(color);
  }
}
