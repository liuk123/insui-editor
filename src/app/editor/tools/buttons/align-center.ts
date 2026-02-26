import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';


@Component({
    standalone: true,
    selector: 'button[insAlignCenterTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.onAlign("center")',
        '[attr.title]': 'insHint()'
    },
})
export class InsAlignCenterButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive({textAlign: 'center'}) ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textAlignCenter;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.justifyCenter ?? '';
    }
}
