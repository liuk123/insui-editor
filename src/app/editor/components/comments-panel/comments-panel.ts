import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { InsEditorCommentAnchor, InsEditorCommentsStore } from '../../common/comments-store';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

@Component({
  selector: 'ins-comments-panel',
  templateUrl: './comments-panel.html',
  styleUrl: './comments-panel.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ins-comments-panel',
    role: 'complementary',
    'aria-label': '评论面板',
  },
})
export class InsCommentsPanel {
  private readonly commentsStore = inject(InsEditorCommentsStore);
  private readonly editor = inject(InsTiptapEditorService, { optional: true });
  private readonly drafts = signal<Record<string, string>>({});

  protected readonly threads = this.commentsStore.threads;
  protected readonly activeThreadId = this.commentsStore.activeThreadId;
  protected readonly canEdit = computed(() => this.editor?.editable ?? false);
  protected readonly openThreads = computed(() =>
    this.threads().filter((thread) => !thread.resolved || thread.id === this.activeThreadId()),
  );

  protected setActiveThread(threadId: string, quote: string, anchor: InsEditorCommentAnchor | null): void {
    this.commentsStore.setActiveThreadId(threadId);
    this.editor?.focusCommentThread(threadId, quote, anchor);
  }

  protected setDraft(threadId: string, value: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [threadId]: value }));
  }

  protected onDraftInput(threadId: string, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.setDraft(threadId, target.value);
  }

  protected getDraft(threadId: string): string {
    return this.drafts()[threadId] ?? '';
  }

  protected addReply(threadId: string): void {
    if (!this.canEdit()) {
      return;
    }
    const draft = this.getDraft(threadId).trim();
    if (!draft) {
      return;
    }
    this.commentsStore.addComment(threadId, draft);
    this.setDraft(threadId, '');
  }

  protected resolveThread(threadId: string, resolved: boolean): void {
    if (!this.canEdit()) {
      return;
    }
    this.commentsStore.resolveThread(threadId, resolved);
  }
}
