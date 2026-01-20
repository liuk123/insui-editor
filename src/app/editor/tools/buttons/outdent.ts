import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

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
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.outdent;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.outdent ?? '';
    }
}
