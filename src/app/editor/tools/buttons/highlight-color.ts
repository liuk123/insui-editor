import { ChangeDetectionStrategy, Component, forwardRef, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdownDirective, InsDropdownOpen, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'button[insHighlightColorTool]',
  imports: [AsyncPipe, InsTextfield],
  template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-palette
                insPalette
                [colors]="colors"
                (selectedColor)="editor?.setBackgroundColor($event)"
            />
        </ng-container>
        @if(!isBlankColor()){
        <div
            insPlate
            [style.background]="editor?.getBackgroundColor()"
        >
          @if(editor?.valueChange$ | async){}
        </div>
        }

    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
  host: {
    insPlateHost: '',
    '[attr.automation-id]': '"toolbar__hilite-button"',
  },
})
export class InsHighlightColorButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective)
  // protected readonly open = inject(InsDropdownOpen);

  @Input()
  public colors: ReadonlyMap<string, string> =
    this.options.backgroundColors ?? this.options.colors;

  @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), { read: TemplateRef })
  protected set template(template: PolymorpheusContent) {
    this.dropdown.insDropdown = template;
  }

  protected override isActive(): boolean {
    return !this.isBlankColor();
  }

  protected isBlankColor(): boolean {
    return (
      this.getBackgroundColor() === this.options.blankColor ||
      this.getBackgroundColor() === 'transparent'
    );
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.textHilite;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    // return this.open.insDropdownOpen() ? '' : (texts?.backColor ?? '');
    return texts?.backColor ?? ''
  }

  protected getBackgroundColor(): string {
    return this.editor?.getBackgroundColor() ?? '';
  }
}
