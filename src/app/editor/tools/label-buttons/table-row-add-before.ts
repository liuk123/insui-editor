import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableRowAddBeforeLabel]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'editor?.addRowBefore()',
    '[attr.title]': 'insHint()',
  },
})
export class InsTableRowAddBeforeLabel extends InsToolbarBase {
  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.tableRowAddBefore;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.tableRowAddBefore ?? '';
  }
}
