import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
    standalone: true,
    selector: 'button[insHrLabel]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [],
    host: {
        '(click)': 'editor?.setHorizontalRule()',
    },
})
export class InsHrButtonLabel extends InsToolbarBase {
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.hr;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.insertHorizontalRule ?? '';
    }
}
