import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insSuperscriptTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleSuperscript()',
    },
})
export class InsSuperscriptButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('superscript') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.sup;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.superscript ?? '';
    }
}
