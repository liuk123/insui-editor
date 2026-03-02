import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insSubscriptTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleSubscript()',
    },
})
export class InsSubscriptButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('subscript') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.sub;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.subscript ?? '';
    }
}
