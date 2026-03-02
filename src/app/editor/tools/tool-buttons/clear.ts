import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insClearTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.removeFormat()',
        '[attr.title]': 'insHint()',
    },
})
export class InsClearButtonTool extends InsToolbarTool {
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.clear;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.clear ?? '';
    }
}
