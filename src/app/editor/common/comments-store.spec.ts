import { TestBed } from '@angular/core/testing';
import { Doc } from 'yjs';
import { InsEditorCommentsStore } from './comments-store';

describe('InsEditorCommentsStore', () => {
  let store: InsEditorCommentsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InsEditorCommentsStore],
    });
    store = TestBed.inject(InsEditorCommentsStore);
  });

  it('should create a thread and set active thread id', () => {
    const threadId = store.createThread('selected text', 'first comment', 'Alice');

    expect(threadId).toBeTruthy();
    expect(store.activeThreadId()).toBe(threadId);
    expect(store.threads().length).toBe(1);
    expect(store.threads()[0]?.comments.length).toBe(1);
  });

  it('should add comment to existing thread', () => {
    const threadId = store.createThread('selected text', 'first comment');

    store.addComment(threadId, 'second comment', 'Bob');

    const comments = store.threads()[0]?.comments ?? [];
    expect(comments.length).toBe(2);
    expect(comments[1]?.author).toBe('Bob');
  });

  it('should resolve and reopen thread', () => {
    const threadId = store.createThread('selected text', 'first comment');

    store.resolveThread(threadId, true);
    expect(store.threads()[0]?.resolved).toBeTrue();

    store.resolveThread(threadId, false);
    expect(store.threads()[0]?.resolved).toBeFalse();
  });

  it('should sync threads with yjs document', () => {
    const document = new Doc();
    store.connectCollaboration(document);

    const threadId = store.createThread('selected text', 'first comment');
    expect(store.threads()[0]?.id).toBe(threadId);

    const yThreads = document.getArray('ins-comments');
    expect(yThreads.length).toBe(1);

    store.disconnectCollaboration();
    document.destroy();
  });
});
