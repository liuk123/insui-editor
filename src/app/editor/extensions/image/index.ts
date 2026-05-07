import { createResizableFileBlockWrapper } from '../common/render/create-resizable-wrapper';
import { Node, nodeInputRule } from '@tiptap/core';
import { createFileBlockWrapper } from '../common/render/create-file-wrapper';

function parseDimensionValue(value: string | null): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parseImageNode(
  image: HTMLImageElement
): Record<string, string | number | boolean | null> {
  return {
    src: image.getAttribute('src'),
    name: image.getAttribute('alt'),
    previewWidth: parseDimensionValue(image.getAttribute('width')) || null
  };
}
export interface InsImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    InsImage: {
      /**
       * Add an image
       * @param options The image attributes
       * @example
       * editor
       *   .commands
       *   .setImage({ src: 'https://tiptap.dev/logo.png', alt: 'tiptap', title: 'tiptap logo' })
       */
      setImage: (options: InsImageOptions) => ReturnType
    }
  }
}
/**
 * Matches an image to a ![image](src "title") on input.
 */
export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export const InsImage = Node.create<InsImageOptions>({
  name: 'image',
  group: 'block',
  inline: false,
  draggable: true,
  selectable: true,
  atom: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        // 'data-content-type': 'image',
      },
    };
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      name: {
        default: null,
      },
      align: {
        default: 'center',
      },
      showPreview: {
        default: true,
      },
      previewWidth: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (node) =>  parseImageNode(node as HTMLImageElement)
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const imageAttr = {
      ...HTMLAttributes,
      draggable: false,
      contenteditable: false,
      loading: 'lazy',
      decoding: 'async',
    }
    return ['img',imageAttr];
  },
   parseMarkdown: (token, helpers) => {
    return helpers.createNode('image', {
      src: token['href'],
      name: token['title'],
    })
  },

  renderMarkdown: node => {
    const src = node.attrs?.['src'] ?? ''
    const alt = node.attrs?.['name'] ?? ''
    const title = node.attrs?.['name'] ?? ''

    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      if (!node.attrs['src']) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.textContent = 'Add Image';
        placeholder.contentEditable = 'false';

        return {
          dom: placeholder,
          update: () => false,
        };
      }
      let contentView = null;
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'bn-visual-media-wrapper';
      imageWrapper.style.width = node.attrs['previewWidth'] + 'px';


      imageWrapper.dataset['src'] = node.attrs['src'] || '';
      imageWrapper.dataset['name'] = node.attrs['name'] || '';
      imageWrapper.dataset['align'] = node.attrs['align'] || '';
      imageWrapper.dataset['showPreview'] = node.attrs['showPreview'] || '';
      imageWrapper.dataset['previewWidth'] = node.attrs['previewWidth'] || '';
      if (node.attrs['showPreview']) {

        const imageElement = document.createElement('img');
        imageElement.src = node.attrs['src'];
        imageElement.alt = node.attrs['name'] || '';

        imageElement.className = 'bn-visual-media';
        imageElement.loading = 'lazy';
        imageElement.decoding = 'async';
        imageWrapper.appendChild(imageElement);

        contentView = createResizableFileBlockWrapper(
          editor,
          { dom: imageWrapper },
          node.attrs,
          imageWrapper,
          this.name,
        );
      } else {
        const file = createFileBlockWrapper(node.attrs);
        imageWrapper.appendChild(file.dom);

        contentView = {
          dom: imageWrapper,
          destroy: ()=>{
            file.destroy?.();
          }
        };
      }


      return contentView;
    };
  },
  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => {
          const [, , , src, title] = match

          return { src, name: title }
        },
      }),
    ]
  },
});
