import {ChangeDetectionStrategy, Component, forwardRef, TemplateRef, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdownDirective, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { InsIndentButtonTool } from './indent';
import { InsOrderedListButtonTool } from './ordered-list';
import { InsOutdentButtonTool } from './outdent';
import { InsTaskListButtonTool } from './task-list';
import { InsUnorderedListButtonTool } from './unordered-list';

@Component({
    standalone: true,
    selector: 'button[insListTool]',
    imports: [
        InsIndentButtonTool,
        InsOrderedListButtonTool,
        InsOutdentButtonTool,
        InsTaskListButtonTool,
        InsTextfield,
        InsUnorderedListButtonTool,
    ],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <div insToolbarDropdownContent>
                <button
                    insUnorderedListTool
                    [editor]="editor"
                ></button>
                <button
                    insOrderedListTool
                    [editor]="editor"
                ></button>
                <button
                    insTaskListTool
                    [editor]="editor"
                ></button>
                <button
                    insIndentTool
                    [editor]="editor"
                ></button>
                <button
                    insOutdentTool
                    [editor]="editor"
                ></button>
            </div>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        '[attr.automation-id]': '"toolbar__ordering-list-button"',
    },
})
export class InsListButtonTool extends InsToolbarTool {
    protected readonly dropdown = insDropdown(null);
    protected readonly open = insDropdownOpen();

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        this.dropdown.set(template);
    }

    protected override isActive(): boolean {
        return (
            this.editor?.isActive('bulletList') ||
            this.editor?.isActive('orderedList') ||
            this.editor?.isActive('taskList') ||
            false
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.listPreview;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return this.open() ? '' : (texts?.list ?? '');
    }
}
