import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableColAddAfterLabel]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'editor?.addColumnAfter()',
    '[attr.title]': 'insHint()',
  },
})
export class InsTableColAddAfterLabel extends InsToolbarBase {
  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.tableColAddAfter;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.tableColAddAfter ?? '';
  }
}
