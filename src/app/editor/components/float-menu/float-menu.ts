import { Component, inject, Input } from '@angular/core';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { InsEditorTool, InsEditorToolType } from '../../common/editor-tool';
import { INS_EDITOR_DEFAULT_TOOLS } from '../../common/default-editor-tools';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { InsBlockquoteButtonTool, InsCodeButtonTool, InsLinkButtonTool, InsListButtonTool } from '../../tools';
import { insGetSelectionState, InsSelectionState } from '../../directives/tiptap-editor/utils/get-selection-state';

@Component({
  selector: 'ins-float-menu',
  imports: [
    InsListButtonTool,
    InsBlockquoteButtonTool,
    InsLinkButtonTool,
    InsCodeButtonTool,
  ],
  templateUrl: './float-menu.html',
  host: {
    // '[class.ins-float-menu]': 'true',
  },
})
export class InsFloatMenu {
  protected readonly options = inject(INS_EDITOR_OPTIONS);
  protected readonly tool: typeof InsEditorTool = InsEditorTool;
  protected toolsSet = new Set<InsEditorToolType>(INS_EDITOR_DEFAULT_TOOLS);

  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
   public get selectionState(): InsSelectionState {
      return insGetSelectionState(this.editor);
    }

  slashDeleteRange(){
    const editor = this.editor?.getOriginTiptapEditor();
    if(!editor){
      return;
    }
    const {from, to} = editor.state.selection
    const before = this.selectionState.before
    const suggestion = before?.startsWith('/') && before.length > 1
            ? before.replace('/', '') || ''
            : ''
    editor?.chain()
            .focus()
            .deleteRange({from: from - (suggestion.length + 1), to})
            .run();
  }
}
