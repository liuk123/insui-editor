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
import { InsEditorLabelOption } from '../../common/editor-font-option';
import { INS_EDITOR_TOOLBAR_TEXTS } from '../../common/i18n';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
  standalone: true,
  selector: 'button[insHeadingTool]',
  imports: [InsDataList, InsOption, InsTextfield],
  template: `
    {{ insHint() }}
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
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen,InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__heading-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsHeadingButtonTool extends InsToolbarTool {
  private readonly levels = [1, 2, 3, 4, 5, 6] as const;
  private readonly dropdown = inject(InsDropdownDirective);

  protected readonly headingOptions = toSignal(
    inject(INS_EDITOR_TOOLBAR_TEXTS).pipe(map((texts) => this.options.headingOptions(texts))),
  );

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });

  constructor() {
    super();
    this.editorChange$.subscribe(() => {
      this.syncHeadingPresentation();
    });
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    const level = this.getActiveHeadingLevel();
    const headingIcons: Record<typeof this.levels[number], string> = {
      1: icons.heading1,
      2: icons.heading2,
      3: icons.heading3,
      4: icons.heading4,
      5: icons.heading5,
      6: icons.heading6,
    };

    return level ? headingIcons[level] : icons.paragraph;
  }
  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    if (!texts) {
      return '';
    }
    const level = this.getActiveHeadingLevel();
    const headingHints: Record<typeof this.levels[number], string> = {
      1: texts.heading1,
      2: texts.heading2,
      3: texts.heading3,
      4: texts.heading4,
      5: texts.heading5,
      6: texts.heading6,
    };

    return level ? headingHints[level] : texts.paragraph;
  }

  protected setHeaderOption({ value }: Partial<InsEditorLabelOption<number>>): void {
    if (value !== undefined && value !== null) {
      this.editor?.setHeading(value);
    } else {
      this.editor?.setParagraph(undefined);
    }
  }

  private getActiveHeadingLevel(): typeof this.levels[number] | null {
    for (const level of this.levels) {
      if (this.editor?.isActive('heading', { level })) {
        return level;
      }
    }

    return null;
  }

  private syncHeadingPresentation(): void {
    if (this.iconDir) {
      this.iconDir.iconStart = this.getIcon(this.options.icons);
    }
    this.insHint.set(this.getHint(this.texts()));
  }
}
