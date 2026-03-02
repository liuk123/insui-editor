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
  InsDropdownPositionSided,
  InsIcon,
  InsOption,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';
import { AsyncPipe } from '@angular/common';
import { INS_EDITOR_CODE_OPTIONS } from '../../common/i18n';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
  standalone: true,
  selector: 'button[insCodeTool]',
  imports: [AsyncPipe, InsDataList, InsOption, InsTextfield],
  template: `
    <ng-container *insTextfieldDropdown>
      <ins-data-list>
        @for (item of codeOptionsTexts$ | async; track index) {
          <button insOption type="button" (click)="onCode(!!$index)">
            {{ item }}
          </button>
        }
      </ins-data-list>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron, {
    directive: InsDropdownPositionSided,
    inputs: ['insDropdownSided']
  }],
  host: {
    '[attr.title]': 'insHint()'
  },
})
export class InsCodeButtonTool extends InsToolbarTool {
  protected readonly codeOptionsTexts$ = inject(INS_EDITOR_CODE_OPTIONS);
  private readonly dropdown = inject(InsDropdownDirective);

  protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    private e = effect(()=>{
      this.dropdown.insDropdown = this.tem();
    })

  protected override isActive(): boolean {
    return (this.editor?.isActive('code') || this.editor?.isActive('codeBlock')) ?? false;
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.code;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.code ?? ''
  }

  protected onCode(isCodeBlock: boolean): void {
    this.editor?.[isCodeBlock ? 'toggleCodeBlock' : 'toggleCode']();
  }
}
