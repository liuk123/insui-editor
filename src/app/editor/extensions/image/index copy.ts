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
      const image = document.createElement('img');

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case 'width':
            case 'height':
              break;
            default:
              image.setAttribute(key, value);
              break;
          }
        }
      });

      image.src = HTMLAttributes['src'];

      const nodeView = new ResizableNodeView({
        element: image,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          image.style.width = `${width}px`;
          image.style.height = `${height}px`;
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
            if(updatedNode.attrs['align'] !== null) {
              image.setAttribute('data-align', updatedNode.attrs['align']);
            }else{
              image.removeAttribute('data-align');
            }
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

      image.onload = () => {
        dom.style.visibility = '';
        dom.style.pointerEvents = '';
      };


      return nodeView;
    };
  },
});
