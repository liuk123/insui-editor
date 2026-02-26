import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  TemplateRef,
  viewChild,
  ViewChild,
} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import {
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

@Component({
  standalone: true,
  selector: 'button[insAlignTool]',
  imports: [
    InsAlignCenterButtonTool,
    InsAlignJustifyButtonTool,
    InsAlignLeftButtonTool,
    InsAlignRightButtonTool,
    InsTextfield,
  ],
  template: `

    <ng-container *insTextfieldDropdown>
      <div insToolbarDropdownContent>
        <button insAlignLeftTool [editor]="editor"></button>
        <button insAlignCenterTool [editor]="editor"></button>
        <button insAlignRightTool [editor]="editor"></button>
        <button insAlignJustifyTool [editor]="editor"></button>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
  host: {
    '[attr.automation-id]': '"toolbar__align-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsAlignButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);

  protected tem = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  private e = effect(() => {
    this.dropdown.insDropdown = this.tem();
  });

  protected override isActive(): boolean {
    return (
      this.editor?.isActive({ textAlign: 'center' }) ||
      this.editor?.isActive({ textAlign: 'justify' }) ||
      this.editor?.isActive({ textAlign: 'left' }) ||
      this.editor?.isActive({ textAlign: 'right' }) ||
      false
    );
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.textAlignPreview;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.justify ?? '';
  }
}
