import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insStrikeTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleStrike()',
        '[attr.title]': 'insHint()'
    },
})
export class InsStrikeButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('strike') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.fontStyleStrike;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.strikeThrough ?? '';
    }
}
