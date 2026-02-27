import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';

import {
  InsAlignButtonTool,
  InsBlockquoteButtonTool,
  InsClearButtonTool,
  InsCodeButtonTool,
  InsFontSizeButtonTool,
  InsHeadingButtonTool,
  InsHighlightColorButtonTool,
  InsLinkButtonTool,
  InsListButtonTool,
  InsRedoButtonTool,
  InsTextColorButtonTool,
  InsUndoButtonTool,
  InsBoldButtonTool,
  InsItalicButtonTool,
  InsUnderlineButtonTool,
  InsStrikeButtonTool,
  InsAlignLeftButtonTool,
  InsAlignCenterButtonTool,
  InsAlignRightButtonTool,
} from '../../tools';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { InsEditorToolType } from '../../common/editor-tool';
import { INS_EDITOR_DEFAULT_TOOLS } from '../../common/default-editor-tools';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { InsTextColorDropdownTool } from '../../tools/buttons/text-color-dropdown';
import { InsHighlightColorDropdownTool } from '../../tools/buttons/highlight-color-dropdown';
import { InsGroup } from "@liuk123/insui";

@Component({
  selector: 'ins-bubble-menu',
  imports: [
    InsClearButtonTool,
    InsCodeButtonTool,
    InsFontSizeButtonTool,
    InsHighlightColorButtonTool,
    InsLinkButtonTool,
    // InsRedoButtonTool,
    InsTextColorButtonTool,
    // InsUndoButtonTool,
    InsHeadingButtonTool,
    InsBoldButtonTool,
    InsItalicButtonTool,
    InsUnderlineButtonTool,
    InsStrikeButtonTool,
    InsAlignLeftButtonTool,
    InsAlignCenterButtonTool,
    InsAlignRightButtonTool,
    InsTextColorDropdownTool,
    InsHighlightColorDropdownTool,
    InsGroup
],
  templateUrl: './bubble-menu.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
  },
})
export class InsBubbleMenu {
  protected readonly options = inject(INS_EDITOR_OPTIONS);
  protected toolsSet = new Set<InsEditorToolType>(INS_EDITOR_DEFAULT_TOOLS);
  public readonly el: HTMLElement | null =
    inject(ElementRef, { optional: true })?.nativeElement ?? null;

  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
}
