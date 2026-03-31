import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
    standalone: true,
    selector: 'button[insCodeLabel]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [],
    host: {
        '(click)': 'editor?.toggleCode()',
    },
})
export class InsCodeButtonLabel extends InsToolbarBase {

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.code;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.code ?? '';
    }
}
