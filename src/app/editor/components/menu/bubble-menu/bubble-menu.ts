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
  InsAlignButtonTool
} from '../../../tools';
import { INS_EDITOR_OPTIONS } from '../../../common/editor-options';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { insDropdownOptionsProvider } from '@liuk123/insui';
import { InsColorButtonTool } from '../../../tools/tool-buttons/color';
import { InsTurnIntoButtonTool } from '../../../tools/tool-buttons/turn-into';
import { InsCommentButtonTool } from '../../../tools/tool-buttons/comment';

@Component({
  selector: 'ins-bubble-menu',
  imports: [
    InsClearButtonTool,
    InsCodeButtonTool,
    InsFontSizeButtonTool,
    InsLinkButtonTool,
    InsTurnIntoButtonTool,
    InsBoldButtonTool,
    InsItalicButtonTool,
    InsUnderlineButtonTool,
    InsStrikeButtonTool,
    InsAlignButtonTool,
    InsColorButtonTool,
    InsCommentButtonTool
],
  templateUrl: './bubble-menu.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[
    insDropdownOptionsProvider({
      direction: 'bottom'
    })
  ]
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
