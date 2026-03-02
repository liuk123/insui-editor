import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';

@Component({
    standalone: true,
    selector: 'button[insTaskListTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'editor?.toggleTaskList()',
        '[attr.automation-id]': '"toolbar__task-list-button"',
    },
})
export class InsTaskListButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('taskList') ?? false;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.taskList;
    }

    protected getHint(): string {
        return '';
    }
}
