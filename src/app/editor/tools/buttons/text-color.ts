import {ChangeDetectionStrategy, Component, effect, inject, Input, TemplateRef, viewChild } from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsChevron, InsDropdownDirective, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen } from '@liuk123/insui';
import { InsLanguageEditor } from '../../i18n/language';
import { InsPalette } from '../../components/palette/palette';

@Component({
    standalone: true,
    selector: 'button[insTextColorTool]',
    imports: [InsTextfield, InsPalette], //InsPaletteModule,
    template: `
        <ng-container *insTextfieldDropdown>
          <ins-palette [colors]='colors' (colorChange)='setFontColor($event)'></ins-palette>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
    host: {
        '[attr.automation-id]': '"toolbar__color-button"',
        '[attr.title]': 'insHint()',
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

    // protected override isActive(): boolean {
    //     return this.editor?.getFontColor() !== EDITOR_BLANK_COLOR;
    // }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textColor;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.foreColor ?? ''
    }
    protected setFontColor(color: string): void {
        this.editor?.setFontColor(color);
    }
}
