import { Mark, mergeAttributes } from '@tiptap/core';
import { MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model';

export type CommentThreadStatus = 'open' | 'closed';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentThread: {
      setCommentThread: (threadId: string, status?: CommentThreadStatus) => ReturnType;
      setCommentThreadStatus: (threadId: string, status: CommentThreadStatus) => ReturnType;
      unsetCommentThread: () => ReturnType;
      unsetCommentThreadById: (threadId: string) => ReturnType;
    };
  }
}

export interface CommentThreadOptions {
  readonly HTMLAttributes: Record<string, string>;
}

interface CommentThreadAttrs {
  readonly threadId?: string | null;
  readonly status?: CommentThreadStatus | null;
  readonly state?: string | null;
}

const collectCommentThreadRanges = (
  doc: ProseMirrorNode,
  markType: MarkType,
  threadId?: string,
): Array<{ from: number; to: number; attrs: CommentThreadAttrs }> => {
  const ranges: Array<{ from: number; to: number; attrs: CommentThreadAttrs }> = [];

  doc.descendants((node, pos) => {
    if (!node.isText) {
      return true;
    }

    const mark = node.marks.find(
      (currentMark) =>
        currentMark.type === markType &&
        (!threadId || currentMark.attrs['threadId'] === threadId),
    );
    if (!mark) {
      return true;
    }

    ranges.push({
      from: pos,
      to: pos + node.nodeSize,
      attrs: mark.attrs as CommentThreadAttrs,
    });
    return true;
  });

  return ranges;
};

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
        renderHTML: (attributes: CommentThreadAttrs) =>
          attributes.threadId ? { 'data-comment-thread-id': attributes.threadId } : {},
      },
      status: {
        default: 'open',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-comment-thread-status') === 'closed' ? 'closed' : 'open',
        renderHTML: (attributes: CommentThreadAttrs) => ({
          'data-comment-thread-status': attributes.status === 'closed' ? 'closed' : 'open',
        }),
      },
      state: {
        default: 'default',
        parseHTML: (element: HTMLElement) => {
          const state = element.getAttribute('data-comment-thread-state');
          return state === 'hovered' || state === 'selected' ? state : 'default';
        },
        renderHTML: (attributes: CommentThreadAttrs) => ({
          'data-comment-thread-state':
            attributes['state'] === 'hovered' || attributes['state'] === 'selected' ?
              attributes['state']
            : 'default',
        }),
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
        (threadId: string, status: CommentThreadStatus = 'open') =>
        ({ commands }) =>
          commands.setMark(this.name, { threadId, status }),
      setCommentThreadStatus:
        (threadId: string, status: CommentThreadStatus) =>
        ({ tr, state: editorState, dispatch }) => {
          const markType = editorState.schema.marks[this.name];
          if (!markType) {
            return false;
          }

          const ranges = collectCommentThreadRanges(editorState.doc, markType, threadId);
          if (ranges.length === 0) {
            return false;
          }

          for (const range of ranges) {
            tr.removeMark(range.from, range.to, markType);
            tr.addMark(
              range.from,
              range.to,
              markType.create({
                ...range.attrs,
                threadId,
                status,
              }),
            );
          }

          dispatch?.(tr);
          return true;
        },
      unsetCommentThread:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
      unsetCommentThreadById:
        (threadId: string) =>
        ({ tr, state: editorState, dispatch }) => {
          const markType = editorState.schema.marks[this.name];
          if (!markType) {
            return false;
          }

          const ranges = collectCommentThreadRanges(editorState.doc, markType, threadId);
          if (ranges.length === 0) {
            return false;
          }

          for (const range of ranges) {
            tr.removeMark(range.from, range.to, markType);
          }

          dispatch?.(tr);
          return true;
        },
    };
  },
});
