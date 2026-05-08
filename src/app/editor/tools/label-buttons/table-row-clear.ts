import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableRowClearLabel]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'editor?.clearRow()',
    '[attr.title]': 'insHint()',
  },
})
export class InsTableRowClearLabel extends InsToolbarBase {
  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.tableRowClear;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.tableRowClear ?? '';
  }
}
