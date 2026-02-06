import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';

import { InsAlignButtonTool, InsBlockquoteButtonTool, InsClearButtonTool, InsCodeButtonTool, InsFontSizeButtonTool, InsHeadingButtonTool, InsHighlightColorButtonTool, InsLinkButtonTool, InsListButtonTool, InsRedoButtonTool, InsTextColorButtonTool, InsUndoButtonTool, InsBoldButtonTool, InsItalicButtonTool, InsUnderlineButtonTool, InsStrikeButtonTool } from '../../tools';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { InsEditorToolType } from '../../common/editor-tool';
import { INS_EDITOR_DEFAULT_TOOLS } from '../../common/default-editor-tools';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

@Component({
  selector: 'ins-bubble-menu',
  imports: [
    InsAlignButtonTool,
    InsBlockquoteButtonTool,
    InsClearButtonTool,
    InsCodeButtonTool,
    InsFontSizeButtonTool,
    InsHighlightColorButtonTool,
    InsLinkButtonTool,
    InsListButtonTool,
    InsRedoButtonTool,
    InsTextColorButtonTool,
    InsUndoButtonTool,
    InsHeadingButtonTool,
    InsBoldButtonTool,
    InsItalicButtonTool,
    InsUnderlineButtonTool,
    InsStrikeButtonTool
  ],
  templateUrl: './bubble-menu.html',
  styleUrl: './bubble-menu.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
