import { Image } from '@tiptap/extension-image';
import { createFigureWithCaption } from '../common/toExternalHTML/create-figure-caption';
import { createLinkWithCaption } from '../common/toExternalHTML/create-link-caption';
import { createResizableFileBlockWrapper } from '../common/render/create-resizable-wrapper';


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
  image: HTMLImageElement,
  figure?: HTMLElement,
  caption?: HTMLElement | null,
): Record<string, string | number | boolean | null> {
  return {
    src: image.getAttribute('src'),
    alt: image.getAttribute('alt'),
    name: image.getAttribute('name'),

    width: parseDimensionValue(image.getAttribute('width')),
    // height: parseDimensionValue(image.getAttribute('height')),
    showPreview: image?.getAttribute('data-show-preview') !== 'false',
    previewWidth: parseDimensionValue(image.getAttribute('data-preview-width')) || null,

    align: figure?.getAttribute('data-align') || null,
    caption: caption?.textContent || null,
  };
}
export const InsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => ({ 'alt': attributes['name'] }),
      },
      align: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-align'),
        renderHTML: (attributes) => ({ 'data-align': attributes['align'] }),
      },
      caption: {
        default: '123',
        parseHTML: (element) => element.getAttribute('data-caption'),
        renderHTML: (attributes) => ({ 'data-caption': attributes['caption'] }),
      },
      showPreview: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-show-preview') !== 'false',
        renderHTML: (attributes) => ({ 'data-show-preview': attributes['showPreview'] }),
      },
      previewWidth: {
        default: 0,
        parseHTML: (element) => parseDimensionValue(element.getAttribute('data-preview-width')),
        renderHTML: (attributes) => ({ 'data-preview-width': attributes['previewWidth'] }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }
          const image = node.querySelector('img');
          if (!(image instanceof HTMLImageElement)) {
            return false;
          }
          const caption = node.querySelector('figcaption');
          return parseImageNode(image, node, caption);
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLImageElement)) {
            return false;
          }
          if (node.closest('figure')) {
            return false;
          }
          return parseImageNode(node);
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    const imageAttrs = {
      ...attrs,
      draggable: false,
      contenteditable: false,
      loading: 'lazy',
      decoding: 'async',
    };
    return ['img', imageAttrs];
  },
  addNodeView() {
    // if ((this.options.resize && !this.options.resize.enabled) || typeof document === 'undefined') {
    //   return null;
    // }
    // const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } =
    //   this.options.resize || {};

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const attrs = HTMLAttributes as Record<string, string | null>;

      if (!attrs['src']) {
        const div = document.createElement('p');
        div.textContent = 'Add Image';
        return {
          dom: div,
        };
      }
      let ret=null;
      if (attrs['data-show-preview']) {
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "bn-visual-media-wrapper";

        const imageElement = document.createElement('img');
        if (typeof attrs['src'] === 'string') {
          imageElement.src = attrs['src'];
        }
        imageElement.alt = attrs['name'] || attrs['caption'] || '';
        if(attrs['data-preview-width']){
          imageElement['width'] = Number(attrs['data-preview-width']!);
        }
        imageWrapper.appendChild(imageElement);

        ret = createResizableFileBlockWrapper(
          editor,
          {dom: imageWrapper},
          attrs,
          imageWrapper,
          this.name
        );
      } else {
        const imageElement = document.createElement('a');
        if (typeof attrs['src'] === 'string') {
          imageElement.href = attrs['src'];
        }
        imageElement.textContent = attrs['name'] || attrs['src'] || '';
        ret = {dom: imageElement};
      }

      if (attrs['data-caption']) {
        if (attrs['data-show-preview']) {
          return createFigureWithCaption(ret?.dom, attrs['data-caption'] || '');
        }else{
          // 设置 fileCaption
          return createLinkWithCaption(ret?.dom, attrs['data-caption'] || '');
        }
      }

      return ret;
    };
  },
});
