import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insOutdentTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.liftListItem()',
        '[attr.automation-id]': '"toolbar_outdent-button"',
    },
})
export class InsOutdentButtonTool extends InsToolbarTool {
  override getDisableState(): boolean {
    const editor = this.editor?.getOriginTiptapEditor();
    if (!editor?.isEditable) {
      return true;
    }

    const type = editor.isActive('taskList') ? 'taskItem' : 'listItem';
    return !editor.can().liftListItem(type);
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.outdent;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.outdent ?? '';
  }
}
