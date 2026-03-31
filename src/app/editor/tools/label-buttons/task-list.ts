import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsToolbarBase } from '../tool-base';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insTaskListLabel]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [],
    host: {
        '(click)': 'editor?.toggleTaskList()',
    },
})
export class InsTaskListButtonLabel extends InsToolbarBase {

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.taskList;
    }
    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.taskList ?? '';
    }
}
