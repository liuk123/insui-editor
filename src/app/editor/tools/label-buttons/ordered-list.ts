import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
    standalone: true,
    selector: 'button[insOrderedListLabel]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [],
    host: {
        '(click)': 'editor?.toggleOrderedList()',
    },
})
export class InsOrderedListButtonLabel extends InsToolbarBase {

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.listOrdered;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.orderedList ?? '';
    }
}
