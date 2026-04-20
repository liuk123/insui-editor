import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
  standalone: true,
  selector: 'button[insCodeTool]',
  imports: [],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool],
  host: {
    '[attr.title]': 'insHint()',
    '(click)': 'onCode()'

  },
})
export class InsCodeButtonTool extends InsToolbarTool {
  protected override isActive(): boolean {
    return this.editor?.isActive('code') ?? false;
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.code;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.code ?? ''
  }

  protected onCode(): void {
    this.editor?.toggleCode();
  }
}
