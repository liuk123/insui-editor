import { computed, Injectable, signal } from '@angular/core';
import { Array as YArray, Doc } from 'yjs';

export interface InsEditorComment {
  readonly id: string;
  readonly content: string;
  readonly author: string;
  readonly createdAt: number;
}

export interface InsEditorCommentAnchor {
  readonly from: number;
  readonly to: number;
  readonly beforeText: string;
  readonly afterText: string;
}

export interface InsEditorCommentThread {
  readonly id: string;
  readonly quote: string;
  readonly anchor: InsEditorCommentAnchor | null;
  readonly createdAt: number;
  readonly resolved: boolean;
  readonly comments: ReadonlyArray<InsEditorComment>;
}

@Injectable()
export class InsEditorCommentsStore {
  private readonly threadsState = signal<ReadonlyArray<InsEditorCommentThread>>([]);
  private readonly activeThreadIdState = signal<string | null>(null);
  private collaborationDoc: Doc | null = null;
  private collaborationKey = '';
  private collaborationThreads: YArray<InsEditorCommentThread> | null = null;
  private collaborationObserver: (() => void) | null = null;
  private currentAuthor = 'Me';

  public readonly threads = computed(() => this.threadsState());
  public readonly activeThreadId = computed(() => this.activeThreadIdState());
  public readonly activeThread = computed(() => {
    const threadId = this.activeThreadIdState();
    if (!threadId) {
      return null;
    }
    return this.threadsState().find((thread) => thread.id === threadId) ?? null;
  });

  public connectCollaboration(document: Doc | null, key = 'ins-comments'): void {
    const isSameSource =
      this.collaborationDoc === document && this.collaborationKey === key && !!this.collaborationThreads;
    if (isSameSource) {
      return;
    }

    this.disconnectCollaboration();
    if (!document) {
      return;
    }

    const threads = document.getArray<InsEditorCommentThread>(key);
    const observer = (): void => {
      this.threadsState.set(threads.toArray().map((thread) => this.normalizeThread(thread)));
    };

    threads.observe(observer);
    this.collaborationDoc = document;
    this.collaborationKey = key;
    this.collaborationThreads = threads;
    this.collaborationObserver = observer;
    observer();
  }

  public setCurrentAuthor(author: string | null): void {
    const trimmedAuthor = (author ?? '').trim();
    this.currentAuthor = trimmedAuthor || 'Me';
  }

  public disconnectCollaboration(): void {
    if (this.collaborationThreads && this.collaborationObserver) {
      this.collaborationThreads.unobserve(this.collaborationObserver);
    }
    this.collaborationThreads = null;
    this.collaborationObserver = null;
    this.collaborationDoc = null;
    this.collaborationKey = '';
  }

  public createThread(
    quote: string,
    firstComment: string,
    author = this.currentAuthor,
    anchor: InsEditorCommentAnchor | null = null,
  ): string {
    const trimmedComment = firstComment.trim();
    if (!trimmedComment) {
      return '';
    }

    const id = this.createId('thread');
    const now = Date.now();
    const thread: InsEditorCommentThread = {
      id,
      quote: quote.trim(),
      anchor,
      createdAt: now,
      resolved: false,
      comments: [
        {
          id: this.createId('comment'),
          content: trimmedComment,
          author,
          createdAt: now,
        },
      ],
    };

    if (this.collaborationThreads) {
      this.collaborationThreads.insert(0, [thread]);
    } else {
      this.threadsState.update((threads) => [thread, ...threads]);
    }
    this.activeThreadIdState.set(id);
    return id;
  }

  public addComment(threadId: string, content: string, author = this.currentAuthor): void {
    const trimmedComment = content.trim();
    if (!trimmedComment) {
      return;
    }

    if (this.collaborationThreads) {
      const threads = this.collaborationThreads.toArray();
      const index = threads.findIndex((thread) => thread.id === threadId);
      if (index < 0) {
        return;
      }
      const current = threads[index];
      if (!current) {
        return;
      }
      const updated: InsEditorCommentThread = {
        ...current,
        comments: [
          ...current.comments,
          {
            id: this.createId('comment'),
            content: trimmedComment,
            author,
            createdAt: Date.now(),
          },
        ],
      };
      this.collaborationThreads.delete(index, 1);
      this.collaborationThreads.insert(index, [updated]);
      return;
    }

    this.threadsState.update((threads) =>
      threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              comments: [
                ...thread.comments,
                {
                  id: this.createId('comment'),
                  content: trimmedComment,
                  author,
                  createdAt: Date.now(),
                },
              ],
            }
          : thread,
      ),
    );
  }

  public setActiveThreadId(threadId: string | null): void {
    this.activeThreadIdState.set(threadId);
  }

  public resolveThread(threadId: string, resolved: boolean): void {
    if (this.collaborationThreads) {
      const threads = this.collaborationThreads.toArray();
      const index = threads.findIndex((thread) => thread.id === threadId);
      if (index < 0) {
        return;
      }
      const current = threads[index];
      if (!current) {
        return;
      }
      this.collaborationThreads.delete(index, 1);
      this.collaborationThreads.insert(index, [{ ...current, resolved }]);
      return;
    }

    this.threadsState.update((threads) =>
      threads.map((thread) => (thread.id === threadId ? { ...thread, resolved } : thread)),
    );
  }

  private normalizeThread(thread: InsEditorCommentThread): InsEditorCommentThread {
    return {
      ...thread,
      anchor:
        thread.anchor ?
          {
            from: thread.anchor.from,
            to: thread.anchor.to,
            beforeText: thread.anchor.beforeText ?? '',
            afterText: thread.anchor.afterText ?? '',
          }
        : null,
      comments: [...thread.comments],
    };
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
