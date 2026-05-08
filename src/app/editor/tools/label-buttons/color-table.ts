import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  InsDropdownDirective,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
  LOCAL_STORAGE,
  InsDropdownPositionSided,
} from '@liuk123/insui';
import { InsLanguageEditor } from '../../i18n/language';
import { InsPalette } from '../../components/palette/palette';
import { InsEditorOptions } from '../../common/editor-options';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableColorLabel]',
  imports: [InsTextfield, InsPalette],
  template: `
  {{ insHint() }}
    <ng-container *insTextfieldDropdown>
      <div class="color-palette">
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
  hostDirectives: [
    InsDropdownDirective,
    InsWithDropdownOpen,
    InsDropdownPositionSided
  ],
  host: {
    '[attr.automation-id]': '"toolbar__hilite-button"',
    '[attr.title]': 'insHint()'
  },
})
export class InsTableColorButtonLabel extends InsToolbarBase {
  private readonly dropdown = inject(InsDropdownDirective);
  private localStorage = inject(LOCAL_STORAGE);

  @Input()
  public colors: ReadonlyMap<string, string> = this.options.backgroundColors ?? this.options.colors;

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected e = effect(() => {
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
