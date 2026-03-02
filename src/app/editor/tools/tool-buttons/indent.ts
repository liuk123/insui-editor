import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insIndentTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.sinkListItem()',
        '[attr.automation-id]': '"toolbar_indent-button"',
    },
})
export class InsIndentButtonTool extends InsToolbarTool {
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.indent;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.indent ?? '';
    }
}
