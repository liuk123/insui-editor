import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsTextfield, InsButton } from '@liuk123/insui';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
  standalone: true,
  selector: 'button[insHighlightColorTool]',
  imports: [InsTextfield, InsButton],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool],
  host: {
    '[attr.automation-id]': '"toolbar__hilite-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsHighlightColorButtonTool extends InsToolbarTool {

  protected override isActive(): boolean {
    return !this.isBlankColor();
  }

  protected isBlankColor(): boolean {
    return (
      this.getBackgroundColor() === this.options.blankColor ||
      this.getBackgroundColor() === 'transparent'
    );
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.textHilite;
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
