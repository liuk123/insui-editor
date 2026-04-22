import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insGroupLabel]',
  imports: [],
  template: ` {{ insHint() }} `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '[attr.title]': 'insHint()',
    '(click)': 'setGroupOption()',
  },
})
export class InsGroupButtonLabel extends InsToolbarBase {

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.insertGroup ?? '';
  }

  protected override getIcon(icons: InsEditorOptions['icons']): string {
    return icons.groupAdd ?? '';
  }


  protected setGroupOption(): void {
    this.editor?.setGroup();
  }
}
