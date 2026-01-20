import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insRemoveGroupTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '[attr.automation-id]': '"toolbar__group-remove-button"',
        '(click)': 'editor?.removeGroup()',
    },
})
export class InsRemoveGroupButtonTool extends InsToolbarTool {
    protected override getDisableState(): boolean {
        return !(this.editor?.isActive('group') ?? false);
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.groupRemove;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.removeGroup ?? '';
    }
}
