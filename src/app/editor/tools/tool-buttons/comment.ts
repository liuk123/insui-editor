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
    // '(pointerdown)': 'captureSelection($event)',
    '(click)': 'toggleCommentThread()',
  },
})
export class InsCommentButtonTool extends InsToolbarTool {
  private readonly commentsStore = inject(InsEditorCommentsStore);

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

  // protected captureSelection(event: PointerEvent): void {
  //   event.preventDefault();
  //   this.editor?.takeSelectionSnapshot();
  // }

  // private tryRestoreSelectionFromSnapshot(): void {
  //   if (!this.editor || !(this.editor.state?.selection.empty ?? true)) {
  //     return;
  //   }

  //   const snapshot = this.editor.getSelectionSnapshot();
  //   if (!snapshot) {
  //     return;
  //   }

  //   const from = Math.min(snapshot.anchor, snapshot.head);
  //   const to = Math.max(snapshot.anchor, snapshot.head);
  //   if (from >= to) {
  //     return;
  //   }

  //   this.editor.setTextSelection({ from, to });
  //   this.editor.focus();
  // }

  protected toggleCommentThread(): void {
    if (!this.editor) {
      return;
    }

    // this.tryRestoreSelectionFromSnapshot();

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
