import {type Injector} from '@angular/core';
import {
    type Attribute,
    type CommandProps,
    mergeAttributes,
    type Node,
    type NodeViewRenderer,
    type NodeViewRendererProps,
    type RawCommands,
} from '@tiptap/core';
import {Image} from '@tiptap/extension-image';
import {isAllowedUri} from '@tiptap/extension-link';
import {type DOMOutputSpec, type NodeSpec} from '@tiptap/pm/model';
import {Plugin} from '@tiptap/pm/state';
import {type EditorView, type NodeView} from '@tiptap/pm/view';
import {take, takeWhile} from 'rxjs';

import {InsImageEditor} from './image-editor';
import { InsEditableImage } from '../../common/image';
import { INS_IMAGE_LOADER } from '../../common/image-loader';
import { isPresent } from '@liuk123/insui';
import { AngularRenderer } from '../tiptap-node-view/AngularRenderer';
import { AngularNodeViewRenderer } from '../tiptap-node-view';

export interface InsImageExtensionOptions {
    injector: Injector;
    draggable?: boolean;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageEditor: {
            setEditableImage(imageConfigs: InsEditableImage): ReturnType;
            setImageLink(): ReturnType;
        };
    }
}

function pasteImage(injector: Injector) {
    return (view: EditorView, event: ClipboardEvent | DragEvent): void => {
        const dataTransfer =
            event instanceof DragEvent ? event.dataTransfer : event.clipboardData;
        const imagesFiles = Array.from(dataTransfer?.files ?? []).filter((file) =>
            /image/i.test(file.type),
        );

        if (imagesFiles.length) {
            event.preventDefault();
        }

        const loader = injector.get(INS_IMAGE_LOADER);

        imagesFiles.forEach((file) => {
            loader(file)
                .pipe(
                    take(1),

                    takeWhile(() => !view.isDestroyed),
                )
                .subscribe((src) => {
                    const node = view.state.schema.nodes['image']?.create({src});
                    const transaction = node
                        ? view.state.tr.replaceSelectionWith(node)
                        : null;

                    setTimeout(() => {
                        if (!view.isDestroyed && transaction) {
                            view.dispatch(transaction);
                        }
                    });
                });
        });
    };
}

function typesafeIsAllowedUri(uri?: string): boolean {
    if (!uri) {
        return false;
    }

    return isAllowedUri(uri) !== null;
}

export function insCreateImageEditorExtension<T, K>({
    injector,
    draggable,
}: {
    draggable?: boolean;
    injector: Injector;
}): Node<T, K> {
    const enableDraggable = isPresent(draggable) ? draggable : true;

    return Image.extend({
        name: 'image',
        priority: 0,
        selectable: true,
        draggable: enableDraggable,

        parseHTML(): NodeSpec['parseDOM'] {
            return [
                {
                    tag: 'a[href] img',
                    // Caretaker note:
                    // Tiptap link extension priority is 1000
                    // ensuring current extension is being handled in precedence
                    priority: 1001,
                    getAttrs: (el: HTMLElement): InsEditableImage | false => {
                        const [href, style] = ['href', 'style'].map(
                            (attrName) => el.getAttribute(attrName) ?? undefined,
                        );

                        if (!typesafeIsAllowedUri(href)) {
                            return false;
                        }

                        const [src, width, alt, title] = [
                            'src',
                            'width',
                            'alt',
                            'title',
                        ].map(
                            (attrName) =>
                                el.firstElementChild?.getAttribute(attrName) ?? undefined,
                        );

                        return {
                            'data-href': href,
                            src: src ?? '',
                            style,
                            width,
                            alt,
                            title,
                        };
                    },
                },
                {tag: 'img'},
            ];
        },

        addAttributes(): Record<keyof InsEditableImage, Attribute> {
            return {
                src: {
                    default: '',
                    keepOnSplit: false,
                },
                width: {
                    default: null,
                    keepOnSplit: false,
                },
                alt: {
                    default: '',
                    keepOnSplit: false,
                },
                style: {
                    default: '',
                    keepOnSplit: false,
                },
                title: {
                    default: '',
                    keepOnSplit: false,
                },
                draggable: {
                    default: enableDraggable ? '' : null,
                    keepOnSplit: false,
                },
                'data-href': {
                    default: null,
                    keepOnSplit: false,
                },
                'data-editing-href': {
                    default: null,
                    keepOnSplit: false,
                },
            };
        },

        renderHTML({HTMLAttributes}: Record<string, any>): DOMOutputSpec {
            const {src, width, alt, style, title, 'data-href': href} = HTMLAttributes;

            if (!href) {
                return ['img', mergeAttributes(HTMLAttributes)];
            }

            return [
                'a',
                mergeAttributes({
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                    href: typesafeIsAllowedUri(href) ? href : '',
                    style: style,
                }),
                [
                    'img',
                    mergeAttributes({
                        src,
                        width,
                        alt,
                        title,
                    }),
                ],
            ];
        },

        addNodeView(): NodeViewRenderer {
            return AngularNodeViewRenderer(InsImageEditor, { injector });
        },

        addCommands(): Partial<RawCommands> {
            return {
                setEditableImage:
                    (attrs: InsEditableImage) =>
                    ({commands}) =>
                        commands.insertContent({
                            type: this.name,
                            attrs,
                        }),
                setImageLink:
                    () =>
                    ({commands}: CommandProps) =>
                        commands.updateAttributes(this.name, {'data-editing-href': true}),
            };
        },

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    props: {
                        handleDOMEvents: {
                            paste: pasteImage(injector),
                            drop: pasteImage(injector),
                        },
                    },
                }),
            ];
        },
    });
}

/**
 * @deprecated use {@link insCreateImageEditorExtension}
 */
export const setup = insCreateImageEditorExtension;
