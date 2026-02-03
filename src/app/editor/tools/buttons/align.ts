import {ChangeDetectionStrategy, Component, forwardRef, inject, TemplateRef, ViewChild} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdown, InsDropdownDirective, InsDropdownOpen, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';

import {InsToolbarTool} from '../tool';
import {InsToolbarButtonTool} from '../tool-button';
import {InsAlignCenterButtonTool} from './align-center';
import {InsAlignJustifyButtonTool} from './align-justify';
import {InsAlignLeftButtonTool} from './align-left';
import {InsAlignRightButtonTool} from './align-right';

@Component({
    standalone: true,
    selector: 'button[insAlignTool]',
    imports: [
        InsAlignCenterButtonTool,
        InsAlignJustifyButtonTool,
        InsAlignLeftButtonTool,
        InsAlignRightButtonTool,
        InsTextfield,
    ],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <div insToolbarDropdownContent>
                <button
                    insAlignLeftTool
                    [editor]="editor"
                ></button>
                <button
                    insAlignCenterTool
                    [editor]="editor"
                ></button>
                <button
                    insAlignRightTool
                    [editor]="editor"
                ></button>
                <button
                    insAlignJustifyTool
                    [editor]="editor"
                ></button>
            </div>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        '[attr.automation-id]': '"toolbar__align-button"',
    },
})
export class InsAlignButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective)
  // protected readonly open = inject(InsDropdownOpen);

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        this.dropdown.insDropdown = template;
    }

    protected override isActive(): boolean {
        return (
            this.editor?.isActive({textAlign: 'center'}) ||
            this.editor?.isActive({textAlign: 'justify'}) ||
            this.editor?.isActive({textAlign: 'left'}) ||
            this.editor?.isActive({textAlign: 'right'}) ||
            false
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textAlignPreview;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        // return this.open.insDropdownOpen() ? '' : (texts?.justify ?? '');
        return texts?.justify ?? ''
    }
}
