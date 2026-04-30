import { Node } from '@tiptap/core';
import { createFileBlockWrapper } from '../common/render/create-file-wrapper';
import { createFigureWithCaption } from '../common/toExternalHTML/create-figure-caption';
import { InsEditorAttachedFile } from '../../common/attached';



declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    InsFileBlock: {
      /**
       * Add an file block
       * @param options The file block attributes
       * @example
       * editor
       *   .commands
       *   .setFile({ src: 'https://tiptap.dev/logo.png', alt: 'tiptap', title: 'tiptap logo' })
       */
      setFileBlock: (options: InsEditorAttachedFile) => ReturnType;
    };
  }
}

export const InsFileBlock = Node.create({
  name: 'fileBlock',
  group: 'block',
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      name: {
        default: null,
      },
      caption: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          const embed = node.querySelector('embed');
          if (!(embed instanceof HTMLEmbedElement)) {
            return false;
          }
          const caption = node.querySelector('figcaption');
          return {
            src: embed.getAttribute('src'),
            caption: caption?.textContent || null,
          };
        },
      },
      {
        tag: 'embed',
        getAttrs: (node) => {
          if (node.closest('figure')) {
            return false;
          }
          return {
            src: node.getAttribute('src'),
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const embedAttr = {
      ...HTMLAttributes,
      contenteditable: false,
    };
    return ['embed', embedAttr];
  },
  addNodeView() {
    return ({ node }) => {
      if (!node.attrs['src']) {
        const placeholder = document.createElement('div');
        placeholder.className = 'file-placeholder';
        placeholder.textContent = 'Add File';
        placeholder.contentEditable = 'false';

        return {
          dom: placeholder,
          update: () => false,
        };
      }

      const file = createFileBlockWrapper(node.attrs);
      if (node.attrs['caption']) {
        return createFigureWithCaption(file, node.attrs['caption']);
      }
      return file;
    };
  },
  addCommands() {
    return {
      setFileBlock:
        (options) =>
        ({ state, chain }) => {
          const { selection } = state;
          const selectedSize = Math.abs(selection.to - selection.from);
          const selectedCaption =
            selectedSize > 0
              ? state.doc.textBetween(selection.from, selection.to, '\n', ' ').trim()
              : '';
          const attrs =
            selectedCaption.length > 0 ? { ...options, caption: selectedCaption } : options;

          if (selectedSize > 0) {
            return chain()
              .focus()
              .insertContentAt(
                {
                  from: selection.from,
                  to: selection.to,
                },
                {
                  type: this.name,
                  attrs,
                },
              )
              .run();
          }

          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs,
            })
            .run();
        },
    };
  },
});
