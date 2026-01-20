import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insUnorderedListTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleUnorderedList()',
        '[attr.automation-id]': '"toolbar__un-ordered-list-button"',
    },
})
export class InsUnorderedListButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('bulletList') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.listUnOrdered;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.unorderedList ?? '';
    }
}
