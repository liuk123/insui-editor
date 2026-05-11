import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { InsEditorCommentAnchor, InsEditorCommentsStore } from '../../common/comments-store';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { InsButton, InsCardLarge, InsTextarea, InsTextfield, InsTitle } from "@liuk123/insui";
import { FormsModule } from '@angular/forms';

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
    InsTitle,
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
  protected readonly openThreads = computed(() =>
    this.threads().filter((thread) => !thread.resolved || thread.id === this.activeThreadId()),
  );

  protected setActiveThread(threadId: string, quote: string, anchor: InsEditorCommentAnchor | null): void {
    this.commentsStore.setActiveThreadId(threadId);
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

  protected resolveThread(threadId: string, resolved: boolean): void {
    if (!this.canEdit()) {
      return;
    }
    this.commentsStore.resolveThread(threadId, resolved);
  }
}
