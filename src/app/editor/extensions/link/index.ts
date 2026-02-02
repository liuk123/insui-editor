import { type KeyboardShortcutCommand, mergeAttributes } from '@tiptap/core';
import { Link, type LinkOptions } from '@tiptap/extension-link';
import { insParseNodeAttributes } from '../../directives/tiptap-editor/utils/parse-node-attributes';
import { insGetSlicedFragment } from '../../directives/tiptap-editor/utils/get-sliced-fragment';
import { insGetCurrentWordBounds } from '../../directives/tiptap-editor/utils/get-current-word-bounds';
import { INS_TIPTAP_WHITESPACE_HACK } from '../../common/hack';

export const InsLink = Link.extend<LinkOptions>({
  addAttributes() {
        return {
            ...this.parent?.(),
            ...insParseNodeAttributes(['download']),
        };
    },
    addCommands() {
        return {
            ...this.parent?.(),
            toggleLink:
                (attributes) =>
                ({chain, state, editor}) => {
                    {
                        const pos = state.selection.from;
                        const resolvedPos = state.doc.resolve(pos);
                        const node = resolvedPos.nodeAfter || resolvedPos.nodeBefore;
                        const isImageNode = node?.type === editor.schema.nodes['image'];

                        if (isImageNode) {
                            return typeof (editor.commands as any).setImageLink ===
                                'function'
                                ? (chain() as any).setImageLink().run()
                                : false;
                        }

                        if (!insGetSlicedFragment(state).trim()) {
                            return false;
                        }

                        const {from, to} = insGetCurrentWordBounds(editor);
                        const forwardSymbol =
                            state.selection.to < state.doc.content.size
                                ? state.doc.textBetween(
                                      state.selection.to,
                                      state.selection.to + 1,
                                  )
                                : '';

                        let toggleMark = chain()
                            .setTextSelection({from, to})
                            .toggleMark(this.name, attributes, {
                                extendEmptyMarkRange: true,
                            })
                            .setMeta('preventAutolink', true)
                            .setTextSelection(to);

                        if (forwardSymbol === '') {
                            toggleMark = toggleMark.insertContent(
                                INS_TIPTAP_WHITESPACE_HACK,
                            );
                        }

                        return toggleMark
                            .setTextSelection({
                                from,
                                to,
                            })
                            .run();
                    }
                },
        };
    },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        target: HTMLAttributes['href']?.startsWith('#') ? '_self' : '_blank',
      }),
      0,
    ];
  },
  addKeyboardShortcuts(): Record<string, KeyboardShortcutCommand> {
    return {
      'Mod-k': ({ editor }) => {
        const isLink = this.editor.isActive('link');
        const editorChain = editor.chain().focus();
        const command = isLink ? editorChain.unsetLink() : editorChain.toggleLink({ href: '' });

        return command.run();
      },
    };
  },
  addPasteRules() {
        return [
            // Workaround for issue: https://github.com/ueberdosis/tiptap/issues/5957
        ];
    },
}).configure({openOnClick: false});
