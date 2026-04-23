import {
  mergeAttributes,
  nodeInputRule,
  ResizableNodeView,
  type CommandProps,
  type RawCommands,
} from '@tiptap/core';
import { Image, type ImageOptions } from '@tiptap/extension-image';

interface FigureCommandOptions {
  readonly src: string;
  readonly alt?: string;
  readonly title?: string;
  readonly caption?: string;
}

export type ImageAlign = 'left' | 'center' | 'right' | null;

const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

function parseDimensionValue(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parseBooleanAttribute(value: string | null | undefined, defaultValue = true): boolean {
  if (value == null) {
    return defaultValue;
  }

  return value !== 'false';
}

function getImageWidth(image: HTMLImageElement): number | null {
  return (
    parseDimensionValue(image.getAttribute('width')) ??
    parseDimensionValue(image.style.width) ??
    (image.width > 0 ? image.width : null)
  );
}

function getImageHeight(image: HTMLImageElement): number | null {
  return (
    parseDimensionValue(image.getAttribute('height')) ??
    parseDimensionValue(image.style.height) ??
    (image.height > 0 ? image.height : null)
  );
}

function parseImageNode(
  image: HTMLImageElement,
  figure?: HTMLElement,
): Record<string, string | number | boolean | null> {
  const width = getImageWidth(image);
  const height = getImageHeight(image);
  const caption = figure?.querySelector('figcaption')?.textContent?.trim() ?? '';
  const align = normalizeAlign(
    figure?.getAttribute('data-align') ?? image.getAttribute('data-align'),
  );
  const showPreview = parseBooleanAttribute(
    figure?.getAttribute('data-show-preview') ?? image.getAttribute('data-show-preview'),
  );
  const previewWidth =
    parseDimensionValue(
      figure?.getAttribute('data-preview-width') ?? image.getAttribute('data-preview-width'),
    ) ?? width;

  return {
    src: image.getAttribute('src'),
    alt: image.getAttribute('alt'),
    title: image.getAttribute('title'),
    width,
    height,
    previewWidth,
    showPreview,
    align,
    caption,
  };
}

function omitAttributes(
  attrs: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const omitted = new Set(keys);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (!omitted.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

function applyImageSize(
  imageElement: HTMLImageElement,
  width: number | null,
  height: number | null,
): void {
  if (width && width > 0) {
    imageElement.style.width = `${width}px`;
  } else {
    imageElement.style.removeProperty('width');
  }

  if (height && height > 0) {
    imageElement.style.height = `${height}px`;
  } else {
    imageElement.style.removeProperty('height');
  }
}

function normalizeAlign(align: unknown): ImageAlign {
  if (align === 'left' || align === 'center' || align === 'right') {
    return align;
  }
  return null;
}

function getSafeAlt(attrs: Record<string, unknown>): string {
  return typeof attrs['alt'] === 'string' ? attrs['alt'] : '';
}

function getSafeTitle(attrs: Record<string, unknown>): string {
  return typeof attrs['title'] === 'string' ? attrs['title'] : '';
}

function getTrimmedCaption(attrs: Record<string, unknown>): string {
  return typeof attrs['caption'] === 'string' ? attrs['caption'].trim() : '';
}

function getPreferredWidth(attrs: Record<string, unknown>): number | null {
  if (typeof attrs['width'] === 'number' && attrs['width'] > 0) {
    return attrs['width'];
  }

  if (typeof attrs['previewWidth'] === 'number' && attrs['previewWidth'] > 0) {
    return attrs['previewWidth'];
  }

  return null;
}

function getPreferredHeight(attrs: Record<string, unknown>): number | null {
  return typeof attrs['height'] === 'number' && attrs['height'] > 0 ? attrs['height'] : null;
}

function getSafeSource(attrs: Record<string, unknown>): string {
  return typeof attrs['src'] === 'string' ? attrs['src'] : '';
}

function syncImageElement(imageElement: HTMLImageElement, attrs: Record<string, unknown>): void {
  const source = getSafeSource(attrs);
  if (imageElement.src !== source) {
    imageElement.src = source;
  }

  const alt = getSafeAlt(attrs);
  if (imageElement.alt !== alt) {
    imageElement.alt = alt;
  }

  const title = getSafeTitle(attrs);
  if (imageElement.title !== title) {
    imageElement.title = title;
  }

  applyImageSize(imageElement, getPreferredWidth(attrs), getPreferredHeight(attrs));
}

function syncAlignState(figure: HTMLElement, align: unknown): void {
  const normalizedAlign = normalizeAlign(align);

  if (normalizedAlign) {
    figure.setAttribute('data-align', normalizedAlign);
    return;
  }

  figure.removeAttribute('data-align');
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insImage: {
      setImageAlign: (align: ImageAlign) => ReturnType;
      setImageCaption: (caption: string) => ReturnType;
      setImageAlt: (alt: string) => ReturnType;
      setImageTitle: (title: string) => ReturnType;
    };
  }
}

export const InsImage = Image.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element) => normalizeAlign(element.getAttribute('data-align')),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-align': normalizeAlign(attributes['align']) ?? undefined,
        }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-caption':
            typeof attributes['caption'] === 'string' && attributes['caption'].trim().length > 0
              ? attributes['caption']
              : undefined,
        }),
      },
      showPreview: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-show-preview') !== 'false',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-show-preview': attributes['showPreview'] === false ? 'false' : undefined,
        }),
      },
      previewWidth: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-preview-width');
          return parseDimensionValue(value);
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-preview-width':
            typeof attributes['previewWidth'] === 'number' && attributes['previewWidth'] > 0
              ? String(attributes['previewWidth'])
              : undefined,
        }),
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('width');
          return parseDimensionValue(value);
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          width:
            typeof attributes['width'] === 'number' && attributes['width'] > 0
              ? String(attributes['width'])
              : undefined,
        }),
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('height');
          return parseDimensionValue(value);
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          height:
            typeof attributes['height'] === 'number' && attributes['height'] > 0
              ? String(attributes['height'])
              : undefined,
        }),
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
          return parseImageNode(image, node);
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
    const figureAttrs = mergeAttributes(
      {
        'data-type': 'image',
        'data-align': normalizeAlign(attrs['align']) ?? undefined,
        class: 'ins-image-figure',
      },
      this.options.HTMLAttributes,
    );
    const imageAttrs = mergeAttributes(
      omitAttributes(attrs, ['caption', 'align', 'showPreview', 'previewWidth']),
      {
        draggable: false,
        contenteditable: false,
        loading: 'lazy',
        decoding: 'async',
        alt: getSafeAlt(attrs),
      },
    );
    const caption = getTrimmedCaption(attrs);

    if (caption.length > 0) {
      return [
        'figure',
        figureAttrs,
        ['img', imageAttrs],
        ['figcaption', { contenteditable: false }, caption],
      ];
    }

    return ['figure', figureAttrs, ['img', imageAttrs]];
  },

  addNodeView() {
    if ((this.options.resize && !this.options.resize.enabled) || typeof document === 'undefined') {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } =
      this.options.resize || {};

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const attrs = HTMLAttributes as Record<string, unknown>;
      const figure = document.createElement('figure');
      figure.setAttribute('data-type', 'image');
      figure.className = 'ins-image-figure';
      figure.setAttribute('contenteditable', 'false');

      const imageElement = document.createElement('img');
      imageElement.setAttribute('draggable', 'false');
      imageElement.setAttribute('contenteditable', 'false');
      imageElement.setAttribute('loading', 'lazy');
      imageElement.setAttribute('decoding', 'async');

      if (typeof attrs['src'] === 'string') {
        imageElement.src = attrs['src'];
      }
      imageElement.alt = getSafeAlt(attrs);
      if (typeof attrs['title'] === 'string') {
        imageElement.title = attrs['title'];
      }

      applyImageSize(imageElement, getPreferredWidth(attrs), getPreferredHeight(attrs));

      figure.append(imageElement);

      const captionElement = document.createElement('figcaption');
      captionElement.setAttribute('contenteditable', 'false');
      const caption = getTrimmedCaption(attrs);
      if (caption.length > 0) {
        captionElement.textContent = caption;
        figure.append(captionElement);
      }

      const nodeView = new ResizableNodeView({
        element: figure,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          applyImageSize(imageElement, width, height);
        },
        onCommit: (width, height) => {
          const position = getPos();
          if (typeof position !== 'number') {
            return;
          }

          this.editor
            .chain()
            .setNodeSelection(position)
            .updateAttributes(this.name, {
              width,
              height,
              previewWidth: width,
            })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }
          const updatedAttrs = updatedNode.attrs as Record<string, unknown>;
          syncImageElement(imageElement, updatedAttrs);

          const align = typeof updatedAttrs['align'] === 'string' ? updatedAttrs['align'] : '';
          syncAlignState(figure, align);

          const updatedCaption = getTrimmedCaption(updatedAttrs);
          if (updatedCaption.length > 0) {
            captionElement.textContent = updatedCaption;
            if (!captionElement.isConnected) {
              figure.append(captionElement);
            }
          } else if (captionElement.isConnected) {
            captionElement.remove();
          }

          return true;
        },
        options: {
          directions,
          min: {
            width: minWidth,
            height: minHeight,
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      const dom = nodeView.dom as HTMLElement;
      dom.style.visibility = 'hidden';
      dom.style.pointerEvents = 'none';

      imageElement.onload = () => {
        dom.style.visibility = '';
        dom.style.pointerEvents = '';
      };

      if (imageElement.complete) {
        dom.style.visibility = '';
        dom.style.pointerEvents = '';
      }

      return nodeView;
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align: ImageAlign) =>
        ({ editor, commands }: Pick<CommandProps, 'editor' | 'commands'>) => {
          if (!editor.isActive(this.name)) {
            return false;
          }
          return commands.updateAttributes(this.name, { align });
        },
      setImageCaption:
        (caption: string) =>
        ({ editor, commands }: Pick<CommandProps, 'editor' | 'commands'>) => {
          if (!editor.isActive(this.name)) {
            return false;
          }
          return commands.updateAttributes(this.name, { caption: caption.trim() });
        },
      setImageAlt:
        (alt: string) =>
        ({ editor, commands }: Pick<CommandProps, 'editor' | 'commands'>) => {
          if (!editor.isActive(this.name)) {
            return false;
          }
          return commands.updateAttributes(this.name, { alt: alt.trim() });
        },
      setImageTitle:
        (title: string) =>
        ({ editor, commands }: Pick<CommandProps, 'editor' | 'commands'>) => {
          if (!editor.isActive(this.name)) {
            return false;
          }
          return commands.updateAttributes(this.name, { title: title.trim() });
        },
      setFigure:
        (options: FigureCommandOptions) =>
        ({ chain }) =>
          chain()
            .focus()
            .setImage({
              src: options.src,
              alt: options.alt,
              title: options.title,
              ...(options.caption ? { caption: options.caption } : {}),
            })
            .run(),
      imageToFigure:
        () =>
        ({ editor, commands }: Pick<CommandProps, 'editor' | 'commands'>) => {
          if (!editor.isActive(this.name)) {
            return false;
          }

          const attrs = editor.getAttributes(this.name) as Record<string, unknown>;
          const caption =
            typeof attrs['caption'] === 'string' && attrs['caption'].trim().length > 0
              ? attrs['caption']
              : typeof attrs['alt'] === 'string'
                ? attrs['alt']
                : '';

          return commands.updateAttributes(this.name, { caption });
        },
      figureToImage:
        () =>
        ({ editor, commands }: Pick<CommandProps, 'editor' | 'commands'>) => {
          if (!editor.isActive(this.name)) {
            return false;
          }
          return commands.updateAttributes(this.name, { caption: '' });
        },
    } as Partial<RawCommands>;
  },

  addInputRules() {
    return [
      ...(this.parent?.() ?? []),
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },
});
