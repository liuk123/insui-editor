import { Image } from '@tiptap/extension-image';
import { ResizableNodeView } from '@tiptap/core';

export const InsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-align'),
        renderHTML: (attributes) => {
          return {
            'data-align': attributes['align']
          };
        },
      },
    };
  },
  addNodeView() {
    if (!this.options.resize || !this.options.resize.enabled || typeof document === 'undefined') {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement('img');

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case 'width':
            case 'height':
              break;
            default:
              el.setAttribute(key, value);
              break;
          }
        }
      });

      el.src = HTMLAttributes['src'];

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) {
            return;
          }

          this.editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, {
              width,
              height,
            })
            .run();
        },
        onUpdate: (updatedNode, _decorations, _innerDecorations) => {
          if (updatedNode.type !== node.type) {
            return false;
          }
          if (updatedNode.attrs['align'] !== node.attrs['align']) {
            return false
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


      // when image is loaded, show the node view to get the correct dimensions
      dom.style.visibility = 'hidden';
      dom.style.pointerEvents = 'none';

      el.onload = () => {
        dom.style.visibility = '';
        dom.style.pointerEvents = '';
      };


      return nodeView;
    };
  },
});
