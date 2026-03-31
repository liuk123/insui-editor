import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
    standalone: true,
    selector: 'button[insClearLabel]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [],
    host: {
        '(click)': 'editor?.removeFormat()',
        '[attr.title]': 'insHint()',
    },
})
export class InsClearLabel extends InsToolbarBase {
    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.clear;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.clear ?? '';
    }
}
