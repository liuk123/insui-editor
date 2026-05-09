import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsEditorCommentsStore } from '../../common/comments-store';

@Component({
  standalone: true,
  selector: 'button[insCommentTool]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool],
  host: {
    '[attr.automation-id]': '"toolbar__comment-button"',
    '[attr.title]': 'insHint()',
    '(click)': 'toggleCommentThread()',
  },
})
export class InsCommentButtonTool extends InsToolbarTool {
  private readonly commentsStore = inject(InsEditorCommentsStore, { optional: true });

  protected override isActive(): boolean {
    return this.editor?.isActive('commentThread') ?? false;
  }

  protected override getDisableState(): boolean {
    if (!this.editor?.editable) {
      return true;
    }
    return this.editor.state?.selection.empty ?? true;
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.comment;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.comment ?? '';
  }

  protected toggleCommentThread(): void {
    if (!this.editor || !this.commentsStore) {
      return;
    }

    if (this.editor.isActive('commentThread')) {
      this.editor.removeCommentThread();
      this.commentsStore.setActiveThreadId(null);
      return;
    }

    const quote = this.editor.getSelectedText();
    const range = this.editor.getSelectionRange();
    const context = this.editor.getSelectionContext(16);
    if (!quote) {
      return;
    }

    const threadId = this.commentsStore.createThread(
      quote,
      '新评论',
      undefined,
      range ?
        {
          from: range.from,
          to: range.to,
          beforeText: context?.beforeText ?? '',
          afterText: context?.afterText ?? '',
        }
      : null,
    );
    if (!threadId) {
      return;
    }

    this.editor.addCommentThread(threadId);
    this.commentsStore.setActiveThreadId(threadId);
  }
}
