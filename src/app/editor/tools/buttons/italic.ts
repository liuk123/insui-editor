import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insItalicTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleItalic()',
        '[attr.title]': 'insHint()'
    },
})
export class InsItalicButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('italic') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.fontStyleItalic;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.italic ?? '';
    }
}
