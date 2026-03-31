import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insBlockquoteLabel]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'toggleBlockquote()',
  },
})
export class InsBlockquoteLabel extends InsToolbarBase {

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.quote;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.quote ?? '';
  }
  toggleBlockquote() {
    this.editor?.toggleBlockquote();
  }
}
