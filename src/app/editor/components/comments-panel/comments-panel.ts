import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { InsEditorCommentAnchor, InsEditorCommentsStore } from '../../common/comments-store';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { InsButton, InsCardLarge, InsTextarea, InsTextfield } from '@liuk123/insui';
import { FormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ins-comments-panel',
  templateUrl: './comments-panel.html',
  styleUrl: './comments-panel.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'complementary',
  },
  imports: [
    InsButton,
    InsCardLarge,
    InsTextfield,
    InsTextarea,
    FormsModule
  ],
})
export class InsCommentsPanel {
  private readonly commentsStore = inject(InsEditorCommentsStore);
  private readonly editor = inject(InsTiptapEditorService, { optional: true });
  protected draft: Record<string, string> = {};

  protected readonly threads = this.commentsStore.threads;
  protected readonly activeThreadId = this.commentsStore.activeThreadId;
  protected readonly canEdit = computed(() => this.editor?.editable ?? false);
  protected readonly hasThreads = computed(() => this.threads().length > 0);

  protected setActiveThread(
    threadId: string,
    quote: string,
    anchor: InsEditorCommentAnchor | null,
    detached: boolean,
  ): void {
    this.commentsStore.setActiveThreadId(threadId);
    if (detached) {
      return;
    }
    this.editor?.focusCommentThread(threadId, quote, anchor);
  }

  protected addReply(threadId: string): void {
    if (!this.canEdit()) {
      return;
    }
    const draft = (this.draft[threadId] ?? '').trim();
    this.draft[threadId] = '';
    if (!draft) {
      return;
    }
    this.commentsStore.addComment(threadId, draft);
  }

  protected toggleThreadState(threadId: string, currentState: 'open' | 'closed'): void {
    if (!this.canEdit()) {
      return;
    }

    const nextState = currentState === 'closed' ? 'open' : 'closed';
    this.commentsStore.setThreadState(threadId, nextState);
    this.editor?.setCommentThreadState(threadId, nextState);
  }

  protected deleteThread(threadId: string): void {
    if (!this.canEdit()) {
      return;
    }

    this.editor?.removeCommentThreadById(threadId);
    this.commentsStore.deleteThread(threadId);
    delete this.draft[threadId];
  }
   protected readonly commentsSync$ = this.editor?.transactionPathChange$
    .pipe(startWith(null), takeUntilDestroyed())
    .subscribe(() => {
      this.commentsStore.syncDetachedThreads(this.editor?.getCommentThreadIds()!);
    });
}
