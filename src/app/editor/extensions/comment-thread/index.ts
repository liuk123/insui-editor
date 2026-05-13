import { Mark, mergeAttributes } from '@tiptap/core';
import { MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export type CommentThreadStatus = 'open' | 'closed';
export type CommentThreadUiState = 'default' | 'selected' | 'hovered';

interface CommentThreadUiPluginState {
  readonly selectedThreadId: string | null;
  readonly hoveredThreadId: string | null;
  readonly decorations: DecorationSet;
}

interface CommentThreadUiPluginMeta {
  readonly selectedThreadId?: string | null;
  readonly hoveredThreadId?: string | null;
}

const COMMENT_THREAD_HOVERED_CLASS = 'ins-comment-thread--hovered';
const COMMENT_THREAD_SELECTED_CLASS = 'ins-comment-thread--selected';

export const commentThreadUiPluginKey = new PluginKey<CommentThreadUiPluginState>(
  'ins-comment-thread-ui',
);

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentThread: {
      setCommentThread: (threadId: string, status?: CommentThreadStatus) => ReturnType;
      setCommentThreadUiState: (
        threadId: string | null,
        value?: CommentThreadUiState,
      ) => ReturnType;
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

const createCommentThreadDecorations = (
  doc: ProseMirrorNode,
  markType: MarkType | undefined,
  uiState: Pick<CommentThreadUiPluginState, 'selectedThreadId' | 'hoveredThreadId'>,
): DecorationSet => {
  if (!markType) {
    return DecorationSet.empty;
  }

  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText) {
      return true;
    }

    const mark = node.marks.find((currentMark) => currentMark.type === markType);
    if (!mark) {
      return true;
    }

    const threadId = mark.attrs['threadId'];
    if (typeof threadId !== 'string' || !threadId) {
      return true;
    }

    const classNames: string[] = [];
    if (threadId === uiState.hoveredThreadId) {
      classNames.push(COMMENT_THREAD_HOVERED_CLASS);
    }
    if (threadId === uiState.selectedThreadId) {
      classNames.push(COMMENT_THREAD_SELECTED_CLASS);
    }

    if (classNames.length > 0) {
      decorations.push(
        Decoration.inline(pos, pos + node.nodeSize, {
          class: classNames.join(' '),
        }),
      );
    }

    return true;
  });

  return DecorationSet.create(doc, decorations);
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
      setCommentThreadUiState:
        (threadId: string | null, value: CommentThreadUiState = 'default') =>
        ({ state: editorState, dispatch }) => {
          const currentState = commentThreadUiPluginKey.getState(editorState) ?? {
            selectedThreadId: null,
            hoveredThreadId: null,
            decorations: DecorationSet.empty,
          };
          const shouldClearAll = threadId === null;
          const shouldClearSelected =
            shouldClearAll ||
            (value === 'default' && currentState.selectedThreadId === threadId);
          const shouldClearHovered =
            shouldClearAll ||
            (value === 'default' && currentState.hoveredThreadId === threadId);
          const nextSelectedThreadId =
            value === 'selected' ? threadId : shouldClearSelected ? null : currentState.selectedThreadId;
          const nextHoveredThreadId =
            value === 'hovered' ? threadId : shouldClearHovered ? null : currentState.hoveredThreadId;

          if (
            currentState.selectedThreadId === nextSelectedThreadId &&
            currentState.hoveredThreadId === nextHoveredThreadId
          ) {
            return true;
          }

          dispatch?.(
            editorState.tr.setMeta(commentThreadUiPluginKey, {
              selectedThreadId: nextSelectedThreadId,
              hoveredThreadId: nextHoveredThreadId,
            } satisfies CommentThreadUiPluginMeta),
          );
          return true;
        },
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

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      new Plugin<CommentThreadUiPluginState>({
        key: commentThreadUiPluginKey,
        state: {
          init: (_, editorState) => ({
            selectedThreadId: null,
            hoveredThreadId: null,
            decorations: createCommentThreadDecorations(
              editorState.doc,
              editorState.schema.marks[this.name],
              {
                selectedThreadId: null,
                hoveredThreadId: null,
              },
            ),
          }),
          apply: (tr, pluginState, _oldState, newState) => {
            const meta = tr.getMeta(commentThreadUiPluginKey) as CommentThreadUiPluginMeta | undefined;
            const nextSelectedThreadId =
              meta?.selectedThreadId !== undefined ? meta.selectedThreadId : pluginState.selectedThreadId;
            const nextHoveredThreadId =
              meta?.hoveredThreadId !== undefined ? meta.hoveredThreadId : pluginState.hoveredThreadId;

            if (
              !tr.docChanged &&
              !meta &&
              nextSelectedThreadId === pluginState.selectedThreadId &&
              nextHoveredThreadId === pluginState.hoveredThreadId
            ) {
              return pluginState;
            }

            return {
              selectedThreadId: nextSelectedThreadId,
              hoveredThreadId: nextHoveredThreadId,
              decorations: createCommentThreadDecorations(
                newState.doc,
                newState.schema.marks[this.name],
                {
                  selectedThreadId: nextSelectedThreadId,
                  hoveredThreadId: nextHoveredThreadId,
                },
              ),
            };
          },
        },
        props: {
          decorations: (editorState) => commentThreadUiPluginKey.getState(editorState)?.decorations,
        },
      }),
    ];
  },
});
