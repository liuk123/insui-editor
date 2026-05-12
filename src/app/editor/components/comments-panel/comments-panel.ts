import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { InsEditorCommentsStore } from '../../common/comments-store';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { InsButton, InsCardLarge, InsTextarea, InsTextfield, InsChip } from '@liuk123/insui';
import { FormsModule } from '@angular/forms';
import { debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ins-comments-panel',
  templateUrl: './comments-panel.html',
  styleUrl: './comments-panel.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'complementary',
    '(click)': '$event.stopPropagation()'
  },
  imports: [
    InsButton,
    InsCardLarge,
    InsTextfield,
    InsTextarea,
    FormsModule,
    InsChip
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
  ): void {
    this.commentsStore.setActiveThreadId(threadId);
  }
  protected setFocus(
    threadId: string,
    detached: boolean,
  ): void {
    this.commentsStore.setActiveThreadId(threadId);
    if (detached) {
      return;
    }
    this.editor?.setCommentThreadUiState(threadId, 'selected');
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

  protected toggleThreadStatus(threadId: string, currentStatus: 'open' | 'closed'): void {
    if (!this.canEdit()) {
      return;
    }

    const nextStatus = currentStatus === 'closed' ? 'open' : 'closed';
    this.commentsStore.setThreadStatus(threadId, nextStatus);
    this.editor?.setCommentThreadStatus(threadId, nextStatus);
  }

  protected deleteThread(threadId: string): void {
    if (!this.canEdit()) {
      return;
    }

    this.editor?.removeCommentThreadById(threadId);
    this.commentsStore.deleteThread(threadId);
    delete this.draft[threadId];
  }
  protected readonly commentsSync$ = this.editor?.transaction$
    .pipe(startWith(null), debounceTime(50), takeUntilDestroyed())
    .subscribe(() => {
      this.commentsStore.syncDetachedThreads(this.editor?.getCommentThreadIds()!);
    });
}
