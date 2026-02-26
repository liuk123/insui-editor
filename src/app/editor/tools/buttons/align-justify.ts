import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insAlignJustifyTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.onAlign("justify")',
        '[attr.title]': 'insHint()'
    },
})
export class InsAlignJustifyButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive({textAlign: 'justify'}) ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textAlignJustify;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.justifyFull ?? '';
    }
}
