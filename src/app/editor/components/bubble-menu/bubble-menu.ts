import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';

import {
  InsClearButtonTool,
  InsCodeButtonTool,
  InsFontSizeButtonTool,
  InsHeadingButtonTool,
  InsLinkButtonTool,
  InsBoldButtonTool,
  InsItalicButtonTool,
  InsUnderlineButtonTool,
  InsStrikeButtonTool,
  InsAlignLeftButtonTool,
  InsAlignCenterButtonTool,
  InsAlignRightButtonTool,
  InsHighlightColorButtonTool,
  InsTextColorButtonTool
} from '../../tools';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

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
],
  templateUrl: './bubble-menu.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
  },
})
export class InsBubbleMenu {
  protected readonly options = inject(INS_EDITOR_OPTIONS);
  public readonly el: HTMLElement | null =
    inject(ElementRef, { optional: true })?.nativeElement ?? null;

  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
}
