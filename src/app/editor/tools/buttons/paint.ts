import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insPaintTool]',
    imports: [AsyncPipe, NgIf, InsPaletteModule, InsTextfield],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-palette
                insPalette
                [colors]="colors"
                (selectedColor)="setCellColor($event)"
            />
        </ng-container>

        <div
            *ngIf="!isBlankColor()"
            insPlate
            [style.background]="editor?.getCellColor() ?? editor?.getGroupColor()"
        >
            <ng-container *ngIf="editor?.valueChange$ | async" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        insPlateHost: '',
    },
})
export class InsPaintButtonTool extends InsToolbarTool {
    protected readonly dropdown = insDropdown(null);
    protected readonly open = insDropdownOpen();

    @Input()
    public colors: ReadonlyMap<string, string> =
        this.options.backgroundColors ?? this.options.colors;

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        this.dropdown.set(template);
    }

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
        return this.open()
            ? ''
            : (this.editor?.isActive('group') && (texts?.hiliteGroup ?? '')) ||
                  (this.editor?.isActive('table') && (texts?.cellColor ?? '')) ||
                  '';
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
