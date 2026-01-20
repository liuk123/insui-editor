import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insDetailsRemoveTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.unsetDetails()',
    },
})
export class InsDetailsRemoveButtonTool extends InsToolbarTool {
    protected override getDisableState(): boolean {
        return !(this.editor?.isActive('details') ?? false);
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.detailsRemove;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.removeDetails ?? '';
    }
}
