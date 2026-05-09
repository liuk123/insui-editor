import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentThread: {
      setCommentThread: (threadId: string) => ReturnType;
      unsetCommentThread: () => ReturnType;
    };
  }
}

export interface CommentThreadOptions {
  readonly HTMLAttributes: Record<string, string>;
}

export const CommentThread = Mark.create<CommentThreadOptions>({
  name: 'commentThread',
  inclusive: false,
  keepOnSplit: true,
  exitable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'ins-comment-thread',
      },
    };
  },

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-comment-thread-id'),
        renderHTML: (attributes: { threadId?: string | null }) =>
          attributes.threadId ? { 'data-comment-thread-id': attributes.threadId } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-thread-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCommentThread:
        (threadId: string) =>
        ({ commands }) =>
          commands.setMark(this.name, { threadId }),
      unsetCommentThread:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
