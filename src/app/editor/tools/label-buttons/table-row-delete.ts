import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableRowDeleteLabel]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'editor?.deleteRow()',
    '[attr.title]': 'insHint()',
  },
})
export class InsTableRowDeleteLabel extends InsToolbarBase {
  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.tableRowDelete;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.tableRowDelete ?? '';
  }
}
