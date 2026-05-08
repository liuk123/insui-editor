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
  selector: 'button[insColorTool]',
  imports: [InsTextfield, InsButton, InsPalette],
  template: `
    <ng-container *insTextfieldDropdown>
      <div class="color-palette" (mousedown.prevent.stop)="(0)">
        <div class="palette-title">字体颜色</div>
        <ins-palette class="block" [colors]="colors" (colorChange)="setFontColor($event)"></ins-palette>
        <div class="palette-title">背景色</div>
        <ins-palette class="block" [colors]="colors" (colorChange)="setBackgroundColor($event)"></ins-palette>
      </div>
    </ng-container>
  `,
  styles: [
    `
    .color-palette{
      padding: var(--ins-padding-m);
      .block{
        margin-block-end: 0.5rem;
      }
    }
    .palette-title {
      font-size: 0.8rem;
      color: var(--ins-text-secondary);
      margin-block-end: 0.25rem;

    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__hilite-button"',
    '[attr.title]': 'insHint()'
  },
})
export class InsColorButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);
  private localStorage = inject(LOCAL_STORAGE);

  @Input()
  public colors: ReadonlyMap<string, string> = this.options.backgroundColors ?? this.options.colors;

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected e =
    effect(() => {
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
  protected setFontColor(color: string): void {
    this.localStorage.setItem('ins-local-font-color', color);
    this.editor?.setFontColor(color);
  }

}
