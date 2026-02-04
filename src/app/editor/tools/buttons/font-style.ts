import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, Input, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsDropdownDirective, InsDropdownOpen, InsLanguageEditor, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { InsBoldButtonTool } from './bold';
import { InsItalicButtonTool } from './italic';
import { InsStrikeButtonTool } from './strike';
import { InsUnderlineButtonTool } from './underline';
import { InsEditorTool, InsEditorToolType } from '../../common/editor-tool';

type Tools = Set<InsEditorToolType> | readonly InsEditorToolType[];

@Component({
  standalone: true,
  selector: 'button[insFontStyleTool]',
  imports: [
    InsBoldButtonTool,
    InsItalicButtonTool,
    InsStrikeButtonTool,
    InsTextfield,
    InsUnderlineButtonTool,
  ],
  template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <div insToolbarDropdownContent>
              @if(isEnabled(editorTool.Bold)){
                <button
                    insBoldTool
                    [editor]="editor"
                >
                    Toggle bold
                </button>
              }
                @if(isEnabled(editorTool.Italic)){
                <button
                    insItalicTool
                    [editor]="editor"
                >
                    Toggle italic
                </button>
                }
                @if(isEnabled(editorTool.Underline)){
                <button
                    insUnderlineTool
                    [editor]="editor"
                >
                    Toggle underline
                </button>
                }
                @if(isEnabled(editorTool.Strikethrough)){
                <button
                    insStrikeTool
                    [editor]="editor"
                >
                    Toggle strike
                </button>
                }
            </div>
        </ng-container>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
  host: {
    '[attr.automation-id]': "'toolbar__font-style-button'",
  },
})
export class InsFontStyleButtonTool extends InsToolbarTool {
  private toolsSet = new Set(this.options.tools);
  private readonly dropdown = inject(InsDropdownDirective)
  protected readonly editorTool = InsEditorTool;

  @Input()
  public set enabledTools(value: Tools) {
    this.toolsSet = new Set(value);;
  }

  public isEnabled(tool: InsEditorToolType): boolean {
    return this.toolsSet.has(tool);
  }

  protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    private e = effect(()=>{
        this.dropdown.insDropdown = this.tem();
    })

  protected override isActive(): boolean {
    return (
      this.editor?.isActive('bold') ||
      this.editor?.isActive('italic') ||
      this.editor?.isActive('underline') ||
      this.editor?.isActive('strike') ||
      false
    );
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.fontStylePreview;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    // return this.open.insDropdownOpen() ? '' : (texts?.fontStyle ?? '');
    return texts?.fontStyle ?? ''
  }
}
