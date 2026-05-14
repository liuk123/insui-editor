import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnListOptions {
  readonly HTMLAttributes: Record<string, string>;
}

const MIN_COLUMNS_NUMBER = 2;
const MAX_COLUMNS_NUMBER = 6;

export const ColumnList = Node.create<ColumnListOptions>({
  name: 'columnList',
  group: 'block',
  content: 'column column+',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'ins-column-list',
      },
    };
  },

  addCommands() {
    return {
      setColumns:
        (n: number = 2) =>
        ({ commands }) => {
          const columnsCount = Math.min(
            MAX_COLUMNS_NUMBER,
            Math.max(MIN_COLUMNS_NUMBER, Math.trunc(n) || MIN_COLUMNS_NUMBER),
          );
          const defaultWidth = 1 / columnsCount;

          return commands.insertContent({
            type: this.name,
            content: Array.from({ length: columnsCount }, () => ({
              type: 'column',
              attrs: {
                width: defaultWidth,
              },
              content: [{ type: 'paragraph' }],
            })),
          });
        },
      unsetColumns:
        () =>
        ({ commands }) => {
          return commands.lift('column');
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columnList"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'columnList',
        'data-columns': `${Math.max(2, node.childCount)}`,
      }),
      0,
    ];
  },
});
