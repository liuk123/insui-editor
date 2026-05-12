import { computed, Injectable, signal } from '@angular/core';
import { Array as YArray, Doc, Map as YMap } from 'yjs';

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

export type InsEditorCommentThreadStatus = 'open' | 'closed';

export interface InsEditorCommentThread {
  readonly id: string;
  readonly quote: string;
  readonly anchor: InsEditorCommentAnchor | null;
  readonly createdAt: number;
  readonly status: InsEditorCommentThreadStatus;
  readonly detached: boolean;
  readonly comments: ReadonlyArray<InsEditorComment>;
}

@Injectable({ providedIn: 'root' })
export class InsEditorCommentsStore {

  private readonly threadsState = signal<ReadonlyArray<InsEditorCommentThread>>([]);
  private readonly activeThreadIdState = signal<string | null>(null);

  private collaborationDoc: Doc | null = null;
  private collaborationKey = '';
  private collaborationRoot: YMap<unknown> | null = null;
  private collaborationThreadOrder: YArray<string> | null = null;
  private collaborationThreadMeta: YMap<YMap<unknown>> | null = null;
  private collaborationThreadComments: YMap<YArray<InsEditorComment>> | null = null;

  private collaborationObserver: (() => void) | null = null;
  private currentAuthor = '';

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
    const keyV2 = `${key}-v2`;
    const isSameSource =
      this.collaborationDoc === document &&
      this.collaborationKey === keyV2 &&
      !!this.collaborationRoot &&
      !!this.collaborationThreadOrder &&
      !!this.collaborationThreadMeta &&
      !!this.collaborationThreadComments;
    if (isSameSource) {
      return;
    }

    this.disconnectCollaboration();
    if (!document) {
      return;
    }

    const root = document.getMap<unknown>(keyV2);
    const order = this.ensureYArray<string>(root, 'order');
    const meta = this.ensureYMap<YMap<unknown>>(root, 'meta');
    const comments = this.ensureYMap<YArray<InsEditorComment>>(root, 'comments');

    const observer = (): void => {
      this.setThreadsState(this.buildThreadsFromCollaboration(order, meta, comments));
    };

    root.observeDeep(observer);
    this.collaborationDoc = document;
    this.collaborationKey = keyV2;
    this.collaborationRoot = root;
    this.collaborationThreadOrder = order;
    this.collaborationThreadMeta = meta;
    this.collaborationThreadComments = comments;
    this.collaborationObserver = observer;
    observer();
  }

  public setCurrentAuthor(author: string | null): void {
    const trimmedAuthor = (author ?? '').trim();
    this.currentAuthor = trimmedAuthor || 'Unknown';
  }

  public disconnectCollaboration(): void {
    if (this.collaborationRoot && this.collaborationObserver) {
      this.collaborationRoot.unobserveDeep(this.collaborationObserver);
    }
    this.collaborationRoot = null;
    this.collaborationThreadOrder = null;
    this.collaborationThreadMeta = null;
    this.collaborationThreadComments = null;
    this.collaborationObserver = null;
    this.collaborationDoc = null;
    this.collaborationKey = '';
  }

  public createThread(
    quote: string,
    anchor: InsEditorCommentAnchor | null = null,
  ): string {
    const id = this.createId('thread');
    const thread: InsEditorCommentThread = {
      id,
      quote: quote.trim(),
      anchor,
      createdAt: Date.now(),
      status: 'open',
      detached: false,
      comments: [],
    };

    if (
      this.collaborationThreadOrder &&
      this.collaborationThreadMeta &&
      this.collaborationThreadComments
    ) {
      this.collaborationThreadOrder.insert(0, [id]);
      this.collaborationThreadMeta.set(id, this.toThreadMeta(thread));
      this.collaborationThreadComments.set(id, new YArray<InsEditorComment>());
    } else {
      this.setThreadsState([thread, ...this.threadsState()]);
    }
    this.activeThreadIdState.set(id);
    return id;
  }

  public addComment(threadId: string, content: string, author = this.currentAuthor): void {
    const trimmedComment = content.trim();
    if (!trimmedComment) {
      return;
    }

    if (this.collaborationThreadComments) {
      const commentsArray = this.collaborationThreadComments.get(threadId);
      if (!commentsArray) {
        return;
      }
      commentsArray.push([
        {
          id: this.createId('comment'),
          content: trimmedComment,
          author: author.trim() || 'Unknown',
          createdAt: Date.now(),
        },
      ]);
      return;
    }

    this.setThreadsState(
      this.threadsState().map((thread) =>
        thread.id === threadId ?
          {
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

  public setThreadStatus(threadId: string, status: InsEditorCommentThreadStatus): void {
    if (this.collaborationThreadMeta) {
      const meta = this.collaborationThreadMeta.get(threadId);
      if (!meta) {
        return;
      }
      meta.set('status', status);
      return;
    }

    this.setThreadsState(
      this.threadsState().map((thread) => (thread.id === threadId ? { ...thread, status } : thread)),
    );
  }

  public deleteThread(threadId: string): void {
    if (
      this.collaborationThreadOrder &&
      this.collaborationThreadMeta &&
      this.collaborationThreadComments
    ) {
      const threadIndex = this.collaborationThreadOrder.toArray().indexOf(threadId);
      if (threadIndex >= 0) {
        this.collaborationThreadOrder.delete(threadIndex, 1);
      }
      this.collaborationThreadMeta.delete(threadId);
      this.collaborationThreadComments.delete(threadId);
    } else {
      this.setThreadsState(this.threadsState().filter((thread) => thread.id !== threadId));
    }

    if (this.activeThreadIdState() === threadId) {
      this.activeThreadIdState.set(null);
    }
  }

  public syncDetachedThreads(attachedThreadIds: ReadonlySet<string>): void {
    if (this.collaborationThreadMeta) {
      for (const thread of this.threadsState()) {
        const meta = this.collaborationThreadMeta.get(thread.id);
        const detached = !attachedThreadIds.has(thread.id);
        if (!meta || Boolean(meta.get('detached')) === detached) {
          continue;
        }
        meta.set('detached', detached);
      }
      return;
    }

    const nextThreads = this.threadsState().map((thread) => {
      const detached = !attachedThreadIds.has(thread.id);
      return thread.detached === detached ? thread : { ...thread, detached };
    });
    this.setThreadsState(nextThreads);
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
      status: thread.status,
      detached: thread.detached,
      comments: [...thread.comments],
    };
  }

  private buildThreadsFromCollaboration(
    order: YArray<string>,
    metaById: YMap<YMap<unknown>>,
    commentsById: YMap<YArray<InsEditorComment>>,
  ): ReadonlyArray<InsEditorCommentThread> {
    return order.toArray().flatMap((threadId) => {
      const meta = metaById.get(threadId);
      if (!meta) {
        return [];
      }

      const quote = String(meta.get('quote') ?? '').trim();
      const createdAt = this.toSafeNumber(meta.get('createdAt'));
      const status = meta.get('status') === 'open'?'open':'closed';
      const detached = Boolean(meta.get('detached'));
      const anchor = this.normalizeAnchor(meta.get('anchor'));
      const comments = commentsById.get(threadId)?.toArray() ?? [];

      return [
        this.normalizeThread({
          id: threadId,
          quote,
          anchor,
          createdAt,
          status,
          detached,
          comments,
        }),
      ];
    });
  }

  private toThreadMeta(thread: InsEditorCommentThread): YMap<unknown> {
    const meta = new YMap<unknown>();
    meta.set('quote', thread.quote);
    meta.set('anchor', thread.anchor);
    meta.set('createdAt', thread.createdAt);
    meta.set('status', thread.status);
    meta.set('detached', thread.detached);
    return meta;
  }

  private setThreadsState(threads: ReadonlyArray<InsEditorCommentThread>): void {
    this.threadsState.set(threads);
    const activeThreadId = this.activeThreadIdState();
    if (activeThreadId && !threads.some((thread) => thread.id === activeThreadId)) {
      this.activeThreadIdState.set(null);
    }
  }

  private ensureYArray<T>(root: YMap<unknown>, key: string): YArray<T> {
    const current = root.get(key);
    if (current instanceof YArray) {
      return current as YArray<T>;
    }
    const created = new YArray<T>();
    root.set(key, created);
    return created;
  }

  private ensureYMap<T>(root: YMap<unknown>, key: string): YMap<T> {
    const current = root.get(key);
    if (current instanceof YMap) {
      return current as YMap<T>;
    }
    const created = new YMap<T>();
    root.set(key, created);
    return created;
  }

  private toSafeNumber(value: unknown): number {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : Date.now();
  }

  private normalizeAnchor(anchor: unknown): InsEditorCommentAnchor | null {
    if (!anchor || typeof anchor !== 'object') {
      return null;
    }
    const rawAnchor = anchor as Partial<InsEditorCommentAnchor>;
    if (typeof rawAnchor.from !== 'number' || typeof rawAnchor.to !== 'number') {
      return null;
    }
    return {
      from: rawAnchor.from,
      to: rawAnchor.to,
      beforeText: rawAnchor.beforeText ?? '',
      afterText: rawAnchor.afterText ?? '',
    };
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
