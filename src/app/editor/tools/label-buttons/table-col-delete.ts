import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableColDeleteLabel]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'editor?.deleteColumn()',
    '[attr.title]': 'insHint()',
  },
})
export class InsTableColDeleteLabel extends InsToolbarBase {
  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.tableColDelete;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.tableColDelete ?? '';
  }
}
