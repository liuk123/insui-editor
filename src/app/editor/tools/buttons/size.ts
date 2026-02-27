import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import {
  InsChevron,
  InsDataList,
  InsDropdownDirective,
  InsIcon,
  InsItem,
  InsOption,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';
import { InsEditorFontSizeOption } from '../../common/editor-font-option';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
  standalone: true,
  selector: 'button[insFontSizeTool]',
  imports: [InsDataList, InsItem, InsOption, InsTextfield],
  template: `
    {{ label() }}
    <ng-container *insTextfieldDropdown>
      <ins-data-list style="min-width: 4rem;">
        @for (item of fontsOptions; track item.name) {
          <button
            insItem
            insOption
            type="button"
            (click)="setFontOption(item)"
          >
            {{ item.name }}
          </button>
        }
      </ins-data-list>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__font-size-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsFontSizeButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);
  protected readonly fontsOptions = this.options.fontSizeOptions();

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  private e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.fontSize;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.fontSize ?? '';
  }
  protected override getLabel(): string {
    const size = this.editor?.getFontSize();
    return this.fontsOptions?.find(opt => opt.px === size)?.name??'';
  }

  protected setFontOption({ px }: Partial<InsEditorFontSizeOption>): void {
    this.editor?.setParagraph({fontSize: (px ?? 0) + 'px'});
  }

}
