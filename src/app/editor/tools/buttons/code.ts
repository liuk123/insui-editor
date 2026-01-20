import {ChangeDetectionStrategy, Component, forwardRef, inject, TemplateRef, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDataList, InsDropdownDirective, InsDropdownOpen, InsLanguageEditor, InsOption, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { AsyncPipe } from '@angular/common';
import { INS_EDITOR_CODE_OPTIONS } from '../../common/i18n';

@Component({
    standalone: true,
    selector: 'button[insCodeTool]',
    imports: [AsyncPipe, InsDataList, InsOption, InsTextfield],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
              @for (item of codeOptionsTexts$ | async; let index = index) {
                <button
                    insOption
                    type="button"
                    (click)="onCode(!!index)"
                >
                    {{ item }}
                </button>
              }
            </ins-data-list>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
})
export class InsCodeButtonTool extends InsToolbarTool {
    protected readonly codeOptionsTexts$ = inject(INS_EDITOR_CODE_OPTIONS);
    protected readonly dropdown = insDropdown(null);
    protected readonly open = InsDropdownOpen();

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        this.dropdown.set(template);
    }

    protected override isActive(): boolean {
        return (
            (this.editor?.isActive('code') || this.editor?.isActive('codeBlock')) ?? false
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.code;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return this.open() ? '' : (texts?.code ?? '');
    }

    protected onCode(isCodeBlock: boolean): void {
        this.editor?.[isCodeBlock ? 'toggleCodeBlock' : 'toggleCode']();
    }
}
