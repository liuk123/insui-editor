import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insInsertGroupTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '[attr.automation-id]': '"toolbar__group-add-button"',
        '(click)': 'editor?.setGroup()',
    },
})
export class InsInsertGroupButtonTool extends InsToolbarTool {
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.groupAdd;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.insertGroup ?? '';
    }
}
