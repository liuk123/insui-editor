import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnListOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnList: {
      /**
       * Add a column list
       */
      setColumns: () => ReturnType;
      /**
       * Remove the column list
       */
      unsetColumns: () => ReturnType;
    };
  }
}

export const ColumnList = Node.create<ColumnListOptions>({
  name: 'columnList',
  group: 'block',
  content: 'column column+',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'column-list',
      },
    };
  },

  addCommands() {
    return {
      setColumns:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              { type: 'column', content: [{ type: 'paragraph' }] },
              { type: 'column', content: [{ type: 'paragraph' }] },
            ],
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

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'columnList',
        style: 'display: flex; gap: 1rem;',
      }),
      0,
    ];
  },
});
