import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insDetailsAddTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.setDetails()',
    },
})
export class InsDetailsAddButtonTool extends InsToolbarTool {
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.detailsAdd;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.setDetails ?? '';
    }
}
