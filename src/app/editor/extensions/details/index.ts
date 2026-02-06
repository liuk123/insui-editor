import {mergeAttributes, type RawCommands} from '@tiptap/core';
import {
  DetailsContent,
  type DetailsContentOptions,
  DetailsSummary,
  type DetailsSummaryOptions,
  Details,
  type DetailsOptions
} from '@tiptap/extension-details';
import { INS_EDITOR_RESIZE_EVENT } from '../../common/default-events';
import { insDeleteNode } from '../../directives/tiptap-editor/utils/delete-nodes';



export interface InsDetailsExtensionOptions extends DetailsOptions {
    inheritOpen?: boolean;
}

interface ServerSideGlobal extends Global {
    document: Document | undefined;
}

declare const globalThis: ServerSideGlobal;

export const InsDetailsExtension = Details.extend<InsDetailsExtensionOptions>({
    addOptions() {
        const parentOptions = this.parent?.() ?? ({} as DetailsOptions);
        return {
            inheritOpen: false,
            persist: parentOptions.persist ?? true,
            openClassName: parentOptions.openClassName ?? '',
            HTMLAttributes: parentOptions.HTMLAttributes ?? {},
        };
    },

    addAttributes() {
        return {
            open: {
                default: 'open',
                keepOnSplit: false,
                parseHTML: (element) =>
                    element.getAttribute('open') === 'open' ||
                    element.getAttribute('open') === 'true' ||
                    element.hasAttribute('open'),
                renderHTML: (attributes) => ({
                    open:
                        attributes['open'] && this.options.inheritOpen ? 'open' : undefined,
                }),
            },
        };
    },

    renderHTML({HTMLAttributes}) {
        return [
            'details',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ({node, getPos, editor}): any => {
            if (globalThis.document) {
                const wrapper = document.createElement('div');
                const details = document.createElement('details');
                const collapseButton = document.createElement('button');
                const deleteButton = document.createElement('button');

                wrapper.className = 't-details-wrapper';
                collapseButton.className = 't-details-arrow';
                collapseButton.type = 'button';
                deleteButton.className = 't-details-delete';
                deleteButton.type = 'button';
                details.open = node.attrs['open'];

                const openHandler = (event: Event): void => {
                    const pos = (getPos as any)?.() ?? 0;

                    details.open = !details.open;
                    (node.attrs as unknown as Record<string, unknown>)['open'] =
                        details.open;

                    event.target?.dispatchEvent(
                        new CustomEvent(INS_EDITOR_RESIZE_EVENT, {bubbles: true}),
                    );

                    editor.chain().focus().setTextSelection(pos).run();
                };

                collapseButton.addEventListener('click', openHandler);

                deleteButton.addEventListener(
                    'click',
                    (e) => {
                        collapseButton.removeEventListener('click', openHandler);
                        editor.commands.unsetDetails();
                        e.preventDefault();
                    },
                    {capture: true, once: true},
                );

                wrapper.append(details, collapseButton, deleteButton);

                return {
                    dom: wrapper,
                    contentDOM: details,
                };
            }
        };
    },
    addCommands(): Partial<RawCommands> {
        return {
            ...this.parent?.(),
            setDetails: () => {
                return ({commands, editor, state}) => {
                    if (editor.isActive('detailsSummary')) {
                        return false;
                    }

                    const {schema, selection} = state;
                    const {$from, $to} = selection;
                    const range = $from.blockRange($to);

                    if (!range) {
                        return false;
                    }

                    const slice = state.doc.slice(range.start, range.end);
                    const match = schema.nodes['detailsContent']?.contentMatch.matchFragment(
                        slice.content,
                    );

                    if (!match) {
                        return false;
                    }

                    commands.insertContentAt(
                        {from: range.start, to: range.end},
                        {
                            type: this.name,
                            content: [
                                {
                                    type: 'detailsSummary',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [],
                                        },
                                    ],
                                },
                                {
                                    type: 'detailsContent',
                                    content: slice.toJSON()?.content ?? [],
                                },
                            ],
                        },
                    );

                    commands.focus();
                    commands.setTextSelection(range.start + 2);

                    return true;
                };
            },
            unsetDetails:
                () =>
                ({state, dispatch}) =>
                    insDeleteNode(state, dispatch, this.name),
        };
    },
});

export const InsDetailsSummary = DetailsSummary.extend<DetailsSummaryOptions>({
    content: 'block+',
    group: 'block',
});

export const InsDetailsContent = DetailsContent.extend<DetailsContentOptions>({
    addNodeView: null,
    parseHTML() {
        return [{tag: 'div[data-type="details-content"]'}];
    },
    renderHTML({HTMLAttributes}) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'details-content',
            }),
            0,
        ];
    },
});
