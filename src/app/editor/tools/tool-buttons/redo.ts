import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insRedoTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '[attr.automation-id]': '"toolbar__redo-button"',
        '(click)': 'editor?.redo()',
    },
})
export class InsRedoButtonTool extends InsToolbarTool {
    protected override getDisableState(): boolean {
        return this.editor?.redoDisabled() ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.redo;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.redo ?? '';
    }
}
