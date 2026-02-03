import {ChangeDetectionStrategy, Component, forwardRef, inject, TemplateRef, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDataList, InsDropdownDirective, InsItem, InsLanguageEditor, InsOption, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InsEditorFontOption } from '../../common/editor-font-option';
import { INS_EDITOR_HEADING_OPTIONS } from '../../common/i18n';

@Component({
    standalone: true,
    selector: 'button[insHeadingTool]',
    imports: [
        InsDataList,
        InsItem,
        InsOption,
        InsTextfield,
    ],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
              @for(item of headingOptions(); track item.name){
                <button
                    insItem
                    insOption
                    type="button"
                    (click)="setHeaderOption(item)"
                >
                    {{ item.name }}
                </button>
              }
            </ins-data-list>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        '[attr.automation-id]': '"toolbar__heading-button"',
    },
})
export class InsHeadingButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective)
  private _currentTemplate: PolymorpheusContent | null = null;

    protected readonly headingOptions = toSignal(
        inject(INS_EDITOR_HEADING_OPTIONS).pipe(
            map((texts) => this.options.headingOptions(texts)),
        )
    );

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        if (template === this._currentTemplate) {
            return;
        }
        this._currentTemplate = template;
        this.dropdown.insDropdown = template;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.paragraph;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.heading ?? ''
    }

    protected setHeaderOption({headingLevel}: Partial<InsEditorFontOption>): void {

        // this.clearPreviousTextStyles();
        if (headingLevel) {
            this.editor?.setHeading(headingLevel);
        } else {
            this.editor?.setParagraph(undefined);
        }
    }
    protected override isActive(): boolean {
        return (
            this.editor?.isActive('paragraph') ||
            this.editor?.isActive('heading') ||
            false
        );
    }

    // private clearPreviousTextStyles(): void {
    //     this.editor?.removeEmptyTextStyle();
    //     this.editor?.toggleMark('textStyle');
    // }
}
