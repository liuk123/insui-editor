import { mergeAttributes, Node, type RawCommands } from '@tiptap/core';
import { insGetSelectedContent } from '../../directives/tiptap-editor/utils/get-selected-content';
import { insDeleteNode } from '../../directives/tiptap-editor/utils/delete-nodes';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    group: {
      removeGroup(): ReturnType;
      setGroup(): ReturnType;
      setGroupHilite(color: string): ReturnType;
    };
  }
}

interface ServerSideGlobal extends Global {
  document: Document | undefined;
}

declare const globalThis: ServerSideGlobal;

export interface InsEditorGroupOptions {
  readonly createOnEnter: boolean;
  readonly nested: boolean;
}

export const INS_EDITOR_GROUP_DEFAULT_OPTIONS: InsEditorGroupOptions = {
  nested: true,
  createOnEnter: false,
};

export const insCreateGroupExtension = (options: Partial<InsEditorGroupOptions> = {}): Node => {
  const { nested, createOnEnter } = {
    ...INS_EDITOR_GROUP_DEFAULT_OPTIONS,
    ...options,
  };

  return Node.create({
    name: 'group',
    group: 'block',
    content: nested ? 'block+' : 'block',

    addAttributes() {
      return {
        style: {
          default: null,
          parseHTML: (element) => element.getAttribute('style'),
          renderHTML: (attributes) => {
            if (!attributes['style']) {
              return {};
            }

            return { style: attributes['style'] };
          },
        },
      };
    },

    parseHTML() {
      return [{ tag: 'div[data-type="group"]' }];
    },

    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'group' }), 0];
    },

    addNodeView() {
      return ({ HTMLAttributes, node }): any => {
        if (globalThis.document) {
          const content = document.createElement('div');

          content.setAttribute('data-type', 'group');

          if (HTMLAttributes['style']) {
            (node.attrs as any).style = HTMLAttributes['style'];
            content.setAttribute('style', HTMLAttributes['style']);
          }

          return { content };
        }

        return null;
      };
    },

    addCommands(): Partial<RawCommands> {
      return {
        setGroup:
          () =>
          ({ commands, state }) => {
            this.editor.chain().focus().run();

            const content = insGetSelectedContent(state, '');
            const wrapped = content.trim().startsWith('<p>') ? content : `<p>${content}</p>`;
            const result = `<div data-type="group">${wrapped}</div>`;

            return commands.insertContent(result);
          },
        setGroupHilite:
          (color: string) =>
          ({ editor }) => {
            let position = editor.state.selection.$anchor;

            /**
             * @note:
             * we can't mutate DOM directly in tiptap
             * find group element for update style attribute
             */
            for (let depth = position.depth; depth > 0; depth--) {
              position = editor.state.selection.$anchor;

              const node = position.node(depth);

              if (node.type.name === this.name) {
                /**
                 * @note:
                 * workaround for `Applying a mismatched transaction`
                 */
                setTimeout(() => {
                  editor.commands.updateAttributes(node.type, {
                    style: `background: ${color}`,
                  });
                });

                break;
              }
            }

            return true;
          },
        removeGroup:
          () =>
          ({ state, dispatch }) =>
            insDeleteNode(state, dispatch, this.name),
      };
    },

    addKeyboardShortcuts(): Record<string, () => boolean> {
      return createOnEnter ? { Enter: () => this.editor.commands.setGroup() } : {};
    },
  });
};
