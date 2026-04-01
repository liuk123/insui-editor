import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  TemplateRef,
  viewChild,
  ViewChild,
} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import {
  InsChevron,
  InsDataList,
  InsDropdownDirective,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';

import { InsToolbarTool } from '../tool';
import { InsToolbarButtonTool } from '../tool-button';
import { InsAlignCenterButtonTool } from './align-center';
import { InsAlignJustifyButtonTool } from './align-justify';
import { InsAlignLeftButtonTool } from './align-left';
import { InsAlignRightButtonTool } from './align-right';
import { InsLanguageEditor } from '../../i18n/language';
import { INS_EDITOR_TOOLBAR_TEXTS } from '../../common/i18n';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'button[insAlignTool]',
  imports: [InsDataList, InsTextfield],
  template: `
    <ng-container *insTextfieldDropdown>
      <ins-data-list>
        @for (item of alignOptions(); track item.name) {
          <button insOption type="button" (click)="setAlignOption(item)">
            {{ item.name }}
          </button>
        }
      </ins-data-list>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__align-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsAlignButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });
  protected alignOptions =toSignal(
    inject(INS_EDITOR_TOOLBAR_TEXTS).pipe(map((texts) => this.options.alignOptions(texts)))
  )

  protected setAlignOption({ value }: { value: string }): void {
    this.editor?.onAlign(value);
  }
  // protected override isActive(): boolean {
  //   return (
  //     this.editor?.isActive({ textAlign: 'center' }) ||
  //     this.editor?.isActive({ textAlign: 'justify' }) ||
  //     this.editor?.isActive({ textAlign: 'left' }) ||
  //     this.editor?.isActive({ textAlign: 'right' }) ||
  //     false
  //   );
  // }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.textAlignPreview;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.justify ?? '';
  }
}
