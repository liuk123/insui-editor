import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insBoldTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleBold()',
        '[attr.title]': 'insHint()'
    },
})
export class InsBoldButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('bold') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.fontStyleBold;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.bold ?? '';
    }
}
