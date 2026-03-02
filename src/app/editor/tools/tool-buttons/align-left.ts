import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insAlignLeftTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.onAlign("left")',
        '[attr.title]': 'insHint()'
    },
})
export class InsAlignLeftButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive({textAlign: 'left'}) ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textAlignLeft;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.justifyLeft ?? '';
    }
}
