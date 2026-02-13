import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
  standalone: true,
  selector: 'button[insBlockquoteTool]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool],
  host: {
    '[attr.automation-id]': '"toolbar__quote-button"',
    '(click)': 'toggleBlockquote()',
  },
})
export class InsBlockquoteButtonTool extends InsToolbarTool {

  protected override isActive(): boolean {
    return this.editor?.isActive('blockquote') ?? false;
  }

  protected override getDisableState(): boolean {
    return this.editor?.isActive('blockquote') ?? false;
  }

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
