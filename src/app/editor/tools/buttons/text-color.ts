import {ChangeDetectionStrategy, Component, forwardRef, inject, Input, TemplateRef, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdownDirective, InsDropdownOpen, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
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
    protected readonly open = inject(InsDropdownOpen);

    @Input()
    public colors: ReadonlyMap<string, string> =
        this.options.textColors ?? this.options.colors;

    private _currentTemplate: PolymorpheusContent | null = null;

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        if (template === this._currentTemplate) {
            return;
        }
        this._currentTemplate = template;
        this.dropdown.insDropdown = template;
    }

    protected override isActive(): boolean {
        return this.editor?.getFontColor() !== EDITOR_BLANK_COLOR;
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.textColor;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return this.open.insDropdownOpen() ? '' : (texts?.foreColor ?? '');
    }
}
