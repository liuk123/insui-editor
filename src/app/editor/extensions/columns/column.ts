import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnOptions {
  HTMLAttributes: Record<string, any>;
}

export const Column = Node.create<ColumnOptions>({
  name: 'column',
  group: 'column',
  content: 'block+',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'column',
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
          return {
            'data-width': attributes['width'],
            style: `flex-grow: ${attributes['width']}; flex-basis: 0; min-width: 2rem;`,
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
