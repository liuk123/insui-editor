import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  InsDataList,
  InsDropdownDirective,
  InsDropdownPositionSided,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insTableAlignLabel]',
  imports: [InsTextfield, InsDataList],
  template: `
    {{ insHint() }}
    <ng-container *insTextfieldDropdown>
      <ins-data-list size="m">
        <ins-opt-group>
          <button insOption size="m" (click)="setHorizontalAlign('left')">左对齐</button>
          <button insOption size="m" (click)="setHorizontalAlign('center')">水平居中</button>
          <button insOption size="m" (click)="setHorizontalAlign('right')">右对齐</button>
        </ins-opt-group>
        <ins-opt-group>
          <button insOption size="m" (click)="setVerticalAlign('top')">顶部对齐</button>
          <button insOption size="m" (click)="setVerticalAlign('middle')">垂直居中</button>
          <button insOption size="m" (click)="setVerticalAlign('bottom')">底部对齐</button>
        </ins-opt-group>
      </ins-data-list>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsDropdownDirective, InsWithDropdownOpen, InsDropdownPositionSided],
  host: {
    '[attr.automation-id]': '"toolbar__table-align-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsTableAlignButtonLabel extends InsToolbarBase {
  private readonly dropdown = inject(InsDropdownDirective);
  protected readonly templateRef = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected readonly bindDropdown = effect(() => {
    this.dropdown.insDropdown = this.templateRef();
  });

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.justify;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.justify ?? '';
  }

  protected setHorizontalAlign(align: 'left' | 'center' | 'right'): void {
    this.editor?.focus();
    this.editor?.setCellAlign(align);
  }

  protected setVerticalAlign(align: 'top' | 'middle' | 'bottom'): void {
    this.editor?.focus();
    this.editor?.setCellVerticalAlign(align);
  }
}
