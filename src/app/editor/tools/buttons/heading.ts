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
  InsOption,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InsEditorHeadingOption } from '../../common/editor-font-option';
import { INS_EDITOR_HEADING_OPTIONS } from '../../common/i18n';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
  standalone: true,
  selector: 'button[insHeadingTool]',
  imports: [InsDataList, InsOption, InsTextfield, InsChevron],
  template: `
    {{ label() }}
    <ng-container *insTextfieldDropdown>
      <ins-data-list>
        @for (item of headingOptions(); track item.name) {
          <button insOption type="button" (click)="setHeaderOption(item)">
            {{ item.name }}
          </button>
        }
      </ins-data-list>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__heading-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsHeadingButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);

  protected readonly headingOptions = toSignal(
    inject(INS_EDITOR_HEADING_OPTIONS).pipe(map((texts) => this.options.headingOptions(texts))),
  );

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  private e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });

  protected getIcon(icons: InsEditorOptions['icons']): string {
    if (this.editor?.isActive('heading', { level: 1 })) {
      return icons.heading1;
    }
    if (this.editor?.isActive('heading', { level: 2 })) {
      return icons.heading2;
    }
    if (this.editor?.isActive('heading', { level: 3 })) {
      return icons.heading3;
    }
    if (this.editor?.isActive('heading', { level: 4 })) {
      return icons.heading4;
    }
    if (this.editor?.isActive('heading', { level: 5 })) {
      return icons.heading5;
    }
    if (this.editor?.isActive('heading', { level: 6 })) {
      return icons.heading6;
    }
    return icons.paragraph;
  }
  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.heading ?? ''
  }
  protected override getLabel(texts?: InsLanguageEditor['toolbarTools']): string {
    if(!texts){
      return ''
    }
    if (this.editor?.isActive('heading', { level: 1 })) {
      return texts.heading1;
    }
    if (this.editor?.isActive('heading', { level: 2 })) {
      return texts.heading2;
    }
    if (this.editor?.isActive('heading', { level: 3 })) {
      return texts.heading3;
    }
    if (this.editor?.isActive('heading', { level: 4 })) {
      return texts.heading4;
    }
    if (this.editor?.isActive('heading', { level: 5 })) {
      return texts.heading5;
    }
    if (this.editor?.isActive('heading', { level: 6 })) {
      return texts.heading6;
    }
    return texts.paragraph;
  }

  protected setHeaderOption({ headingLevel }: Partial<InsEditorHeadingOption>): void {
    this.clearPreviousTextStyles();
    if (headingLevel) {
      this.editor?.setHeading(headingLevel);
    } else {
      this.editor?.setParagraph(undefined);
    }
  }


  private clearPreviousTextStyles(): void {
    this.editor?.removeEmptyTextStyle();
    this.editor?.toggleMark('textStyle');
  }
}
