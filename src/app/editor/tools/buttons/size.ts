import {ChangeDetectionStrategy, Component, effect, forwardRef, inject, TemplateRef, viewChild, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDataList, InsDropdownDirective, InsItem, InsLanguageEditor, InsOption, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import { map } from 'rxjs';
import { EDITOR_BLANK_COLOR } from '../../common/default-editor-colors';
import { InsEditorFontOption } from '../../common/editor-font-option';
import { INS_EDITOR_FONT_OPTIONS } from '../../common/i18n';

@Component({
    standalone: true,
    selector: 'button[insFontSizeTool]',
    imports: [
        AsyncPipe,
        NgClass,
        NgStyle,
        InsDataList,
        InsItem,
        InsOption,
        InsTextfield,
    ],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
              @for(item of fontsOptions$ | async; track item.name){
                <button
                    insItem
                    insOption
                    type="button"
                    [ngClass]="item?.ngClass || {}"
                    [ngStyle]="item?.ngStyle || {}"
                    [style.font-family]="item.family"
                    [style.font-size.px]="item.px"
                    [style.font-weight]="item.weight"
                    (click)="setFontOption(item)"
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
        '[attr.automation-id]': '"toolbar__font-size-button"',
    },
})
export class InsFontSizeButtonTool extends InsToolbarTool {

  private readonly dropdown = inject(InsDropdownDirective)

    protected readonly fontsOptions$ = inject(INS_EDITOR_FONT_OPTIONS).pipe(
        map((texts) => this.options.fontOptions(texts)),
    );

    protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    private e = effect(()=>{
            this.dropdown.insDropdown = this.tem();
    })

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.fontSize;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.font ?? ''
    }

    protected setFontOption({headingLevel, px}: Partial<InsEditorFontOption>): void {
        const color = this.editor?.getFontColor() ?? EDITOR_BLANK_COLOR;

        this.clearPreviousTextStyles();

        if (headingLevel) {
            this.editor?.setHeading(headingLevel);
        } else {
            this.editor?.setParagraph({fontSize: (px ?? 0) + 'px'});
        }

        if (color !== EDITOR_BLANK_COLOR) {
            this.editor?.setFontColor(color);
        }
    }

    private clearPreviousTextStyles(): void {
        this.editor?.removeEmptyTextStyle();
        this.editor?.toggleMark('textStyle');
    }
}
