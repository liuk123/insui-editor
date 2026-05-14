import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnOptions {
  readonly HTMLAttributes: Record<string, string>;
}

export const Column = Node.create<ColumnOptions>({
  name: 'column',
  group: 'columnList',
  content: 'block+',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'ins-column',
      },
    };
  },

  addAttributes() {
    return {
      width: {
        default: 1,
        parseHTML: (element) => {
          const attr = element.getAttribute('data-width');
          if (attr === null) {
            return null;
          }
          const parsed = parseFloat(attr);
          return isFinite(parsed) ? parsed : null;
        },
        renderHTML: (attributes) => {
          const width = Number(attributes['width']);
          const normalizedWidth = Number.isFinite(width) && width > 0 ? width : 1;

          return {
            'data-width': `${normalizedWidth}`,
            style: `flex-grow: ${normalizedWidth}; flex-basis: 0; min-width: 6rem;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'column' }),
      0,
    ];
  },
});
