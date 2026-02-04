import {ChangeDetectionStrategy, Component, effect, inject, Input, TemplateRef, viewChild } from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdownDirective, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { EDITOR_BLANK_COLOR } from '../../common/default-editor-colors';

@Component({
    standalone: true,
    selector: 'button[insTextColorTool]',
    imports: [InsTextfield], //InsPaletteModule,
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
          color
            <!-- <ins-palette
                insPalette
                [colors]="colors"
                (selectedColor)="editor?.setFontColor($event)"
            /> -->
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        '[attr.automation-id]': '"toolbar__color-button"',
    },
})
export class InsTextColorButtonTool extends InsToolbarTool {
    private readonly dropdown = inject(InsDropdownDirective)

    @Input()
    public colors: ReadonlyMap<string, string> =
        this.options.textColors ?? this.options.colors;

    protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    private e = effect(()=>{
        this.dropdown.insDropdown = this.tem();
    })

    protected override isActive(): boolean {
        return this.editor?.getFontColor() !== EDITOR_BLANK_COLOR;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textColor;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.foreColor ?? ''
    }
}
