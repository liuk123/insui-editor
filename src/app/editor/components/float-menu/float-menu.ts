import { Component, inject, Input } from '@angular/core';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

import {
  insGetSelectionState,
  InsSelectionState,
} from '../../directives/tiptap-editor/utils/get-selection-state';
import { injectElement, InsDataList } from '@liuk123/insui';

interface MyCommand {
  name: string;
  key: string;
  desc?: string;
}

@Component({
  selector: 'ins-float-menu',
  imports: [
    InsDataList
  ],
  templateUrl: './float-menu.html',
  host: {
    '(window:keydown.arrowUp)': 'down($event, false)',
    '(window:keydown.arrowDown)': 'down($event, true)',
  },
})
export class InsFloatMenu {
  protected readonly options = inject(INS_EDITOR_OPTIONS);
  protected el = injectElement();

  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
  public get selectionState(): InsSelectionState {
    return insGetSelectionState(this.editor);
  }

  protected get suggestion(): string {
    const before = this.selectionState.before;
    return before?.startsWith('/') && before.length > 1 ? before.replace('/', '') || '' : '';
  }

  protected readonly items: readonly MyCommand[] = [
    {
      name: '一级标题',
      key: 'heading1',
    },
    {
      name: '二级标题',
      key: 'heading2',
    },
    {
      name: '三级标题',
      key: 'heading3',
    },
    {
      name: '加粗',
      key: 'bold',
    },
    {
      name: '斜体',
      key: 'italic',
    },
  ];

  protected filter(search?: string): readonly MyCommand[] {
    return search?.length
      ? this.items.filter(({ key }) =>
          key.toLocaleLowerCase().startsWith(search.toLocaleLowerCase()),
        )
      : this.items;
  }

  protected command(command: MyCommand): void {
    const editor = this.editor?.getOriginTiptapEditor();

    if (!editor) {
      return;
    }
    const { from, to } = editor.state.selection;
    editor
      .chain()
      .focus()
      .deleteRange({ from: from - (this.suggestion.length + 1), to })
      .run();

    switch (command.key) {
      case 'bold':
        editor.chain().toggleBold().run();
        break;
      case 'heading1':
        editor.chain().setNode('heading', { level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().setNode('heading', { level: 2 }).run();
        break;
      case 'italic':
        editor.chain().toggleItalic().run();
        break;
    }
  }
  protected down(event: Event, isDown: boolean): void {
      const buttons = Array.from(this.el?.querySelectorAll('button') ?? []);
      const button = isDown ? buttons[0] : buttons[buttons.length - 1];

      if (!this.el?.contains(event.target as any)) {
          button?.focus();
      }
  }
}
