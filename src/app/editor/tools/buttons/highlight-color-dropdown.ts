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
import { InsDropdownDirective, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, InsButton } from '@liuk123/insui';
import { InsLanguageEditor } from '../../i18n/language';
import { InsPalette } from '../../components/palette/palette';

@Component({
  standalone: true,
  selector: 'button[insHighlightColorDropdownTool]',
  imports: [InsTextfield, InsButton, InsPalette],
  template: `
    <ng-container *insTextfieldDropdown>
      <ins-palette [colors]='colors' (colorChange)='setBackgroundColor($event)'></ins-palette>
    </ng-container>
  `,
  styles: [
    `
    .highlight-color-item {
      height: 1rem;
      width: 0.5rem;
      border-radius:0.25rem;
    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
  host: {
    '[attr.automation-id]': '"toolbar__hilite-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsHighlightColorDropdownTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);


  @Input()
  public colors: ReadonlyMap<string, string> = this.options.backgroundColors ?? this.options.colors;

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  private e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });

  protected override isActive(): boolean {
    return !this.isBlankColor();
  }

  protected isBlankColor(): boolean {
    return (
      this.getBackgroundColor() === this.options.blankColor ||
      this.getBackgroundColor() === 'transparent'
    );
  }

  protected getIcon(): string {
    return 'chevron-down';
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.backColor ?? '';
  }

  protected getBackgroundColor(): string {
    return this.editor?.getBackgroundColor() ?? '';
  }
  protected setBackgroundColor(color: string): void {
    this.editor?.setBackgroundColor(color);
  }
}
