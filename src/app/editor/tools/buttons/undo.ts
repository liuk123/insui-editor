import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insUndoTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '[attr.automation-id]': '"toolbar__undo-button"',
        '(click)': 'editor?.undo()',
    },
})
export class InsUndoButtonTool extends InsToolbarTool {
    protected override getDisableState(): boolean {
        return this.editor?.undoDisabled() ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.undo;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.undo ?? '';
    }
}
