import {ChangeDetectionStrategy, Component, effect, inject, Input, TemplateRef, viewChild } from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdownDirective, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen } from '@liuk123/insui';
import { AsyncPipe } from '@angular/common';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insPaintTool]',
    imports: [AsyncPipe, InsTextfield], // InsPaletteModule
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
          color
            <!-- <ins-palette
                insPalette
                [colors]="colors"
                (selectedColor)="setCellColor($event)"
            /> -->
        </ng-container>
        @if(!isBlankColor()){
        <div
            insPlate
            [style.background]="editor?.getCellColor() ?? editor?.getGroupColor()"
        >
            @if(editor?.valueChange$ | async){}
        </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        insPlateHost: '',
    },
})
export class InsPaintButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective)

    @Input()
    public colors: ReadonlyMap<string, string> =
        this.options.backgroundColors ?? this.options.colors;

    protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    private e = effect(()=>{
          this.dropdown.insDropdown = this.tem();
        })
    protected override isActive(): boolean {
        return !this.isBlankColor();
    }

    protected override getDisableState(): boolean {
        return !(
            this.editor?.isActive('table') ??
            this.editor?.isActive('group') ??
            false
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.paint;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return (this.editor?.isActive('group') && (texts?.hiliteGroup ?? '')) ||
                  (this.editor?.isActive('table') && (texts?.cellColor ?? '')) ||
                  ''
    }

    protected setCellColor(color: string): void {
        if (this.editor?.isActive('group')) {
            this.editor.setGroupHilite(color);
        } else if (this.editor?.isActive('table')) {
            this.editor.setCellColor(color);
        }
    }

    protected isBlankColor(): boolean {
        return this.getColor() === this.options.blankColor || this.getColor() === '';
    }

    protected getColor(): string {
        return this.editor?.getCellColor() ?? this.editor?.getGroupColor() ?? '';
    }
}
