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
      this.threadsState.set(this.buildThreadsFromCollaboration(order, meta, comments));
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
      resolved: false,
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
    if (this.collaborationThreadMeta) {
      const meta = this.collaborationThreadMeta.get(threadId);
      if (!meta) {
        return;
      }
      meta.set('resolved', resolved);
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
      const resolved = Boolean(meta.get('resolved'));
      const anchor = this.normalizeAnchor(meta.get('anchor'));
      const comments = commentsById.get(threadId)?.toArray() ?? [];

      return [
        this.normalizeThread({
          id: threadId,
          quote,
          anchor,
          createdAt,
          resolved,
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
    meta.set('resolved', thread.resolved);
    return meta;
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
