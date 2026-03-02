import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insUnderlineTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleUnderline()',
        '[attr.title]': 'insHint()'
    },
})
export class InsUnderlineButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('underline') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.fontStyleUnderline;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.underline ?? '';
    }
}
