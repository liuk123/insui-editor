import { Component, inject, Input } from '@angular/core';
import { injectElement, InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { INS_EDITOR_COLLABORATION } from '../../../common/editor-collaboration';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import {
  insGetSelectionState,
  InsSelectionState,
} from '../../../directives/tiptap-editor/utils/get-selection-state';
import { type InsMentionItem, type InsMentionOptions } from '../../../extensions/mention';

@Component({
  selector: 'ins-mention-menu',
  imports: [InsDataList],
  templateUrl: './mention-menu.html',
  host: {
    '(window:keydown.arrowUp)': 'down($event, false)',
    '(window:keydown.arrowDown)': 'down($event, true)',
  },
})
export class InsMentionMenu {
  private readonly collaboration = inject(INS_EDITOR_COLLABORATION);
  protected readonly el = injectElement();

  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  public get selectionState(): InsSelectionState {
    return insGetSelectionState(this.editor);
  }

  protected get suggestion(): string {
    const before = this.selectionState.before;
    return before.startsWith('@') ? before.slice(1).trim() : '';
  }

  protected filter(search = ''): ReadonlyArray<InsMentionItem> {
    const keyword = search.toLocaleLowerCase();
    const items = this.getMentionItems();

    return keyword.length > 0 ?
        items.filter(
          ({ id, label }) =>
            id.toLocaleLowerCase().includes(keyword) || label.toLocaleLowerCase().includes(keyword),
        )
      : items;
  }

  protected command(item: InsMentionItem): void {
    const editor = this.editor?.getOriginTiptapEditor();
    if (!editor) {
      return;
    }

    const { from, to } = editor.state.selection;
    editor
      .chain()
      .focus()
      .deleteRange({ from: from - (this.suggestion.length + 1), to })
      .setMention(item)
      .insertContent(' ')
      .run();
  }

  protected down(event: Event, isDown: boolean): void {
    const buttons = Array.from(this.el?.querySelectorAll('button') ?? []);
    const button = isDown ? buttons[0] : buttons[buttons.length - 1];

    if (!this.el?.contains(event.target as Node | null)) {
      button?.focus();
    }
  }

  private getMentionItems(): ReadonlyArray<InsMentionItem> {
    const configuredItems = this.getConfiguredMentionItems();
    if (configuredItems.length > 0) {
      return configuredItems;
    }

    const awarenessItems = this.getAwarenessMentionItems();
    if (awarenessItems.length > 0) {
      return awarenessItems;
    }

    return [
      {
        id: this.collaboration.user.name,
        label: this.collaboration.user.name,
        color: this.collaboration.user.color,
      },
    ];
  }

  private getConfiguredMentionItems(): ReadonlyArray<InsMentionItem> {
    const editor = this.editor?.getOriginTiptapEditor();
    const extension = editor?.extensionManager.extensions.find((item) => item.name === 'mention');
    const options = extension?.options as Partial<InsMentionOptions> | undefined;

    return options?.items ?? [];
  }

  private getAwarenessMentionItems(): ReadonlyArray<InsMentionItem> {
    const awareness = this.collaboration.provider?.awareness as
      | { getStates?: () => Map<number, unknown> }
      | undefined;
    const states = awareness?.getStates?.();
    if (!(states instanceof Map)) {
      return [];
    }

    const items = Array.from(states.values()).flatMap((state) => {
      if (!state || typeof state !== 'object' || !('user' in state)) {
        return [];
      }

      const user = state['user'] as any;
      if (!user || typeof user !== 'object') {
        return [];
      }

      const name = typeof user['name'] === 'string' ? user['name'].trim() : '';
      if (!name) {
        return [];
      }

      return [
        {
          id: name,
          label: name,
          color: typeof user['color'] === 'string' ? user['color'] : undefined,
        },
      ];
    });

    const uniqueItems = new Map<string, InsMentionItem>();
    for (const item of items) {
      uniqueItems.set(item.id, item);
    }

    return [...uniqueItems.values()];
  }
}
