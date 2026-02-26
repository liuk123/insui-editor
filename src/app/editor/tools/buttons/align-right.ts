import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insAlignRightTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.onAlign("right")',
        '[attr.title]': 'insHint()'
    },
})
export class InsAlignRightButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive({textAlign: 'right'}) ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textAlignRight;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.justifyRight ?? '';
    }
}
