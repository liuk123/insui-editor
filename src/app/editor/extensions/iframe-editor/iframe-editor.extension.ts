import {type Injector} from '@angular/core';
import {
    type Attribute,
    mergeAttributes,
    Node,
    type NodeViewRenderer,
    type RawCommands,
} from '@tiptap/core';
import {type DOMOutputSpec, type NodeSpec} from '@tiptap/pm/model';
import { InsEditableIframe } from '../../common/iframe';
import { AngularNodeViewRenderer } from '../tiptap-node-view';
import { InsIframeEditor } from './iframe-editor.component';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        iframe: {
            setIframe(options: InsEditableIframe): ReturnType;
        };
    }
}

export const insCreateIframeEditorExtension = ({injector}: {injector: Injector}): Node =>
    Node.create({
        name: 'iframe',
        group: 'block',
        atom: true,
        draggable: false,

        parseHTML(): NodeSpec['parseDOM'] {
            return [{tag: 'iframe'}];
        },

        addAttributes(): Record<keyof InsEditableIframe, Attribute> {
            return {
                src: {
                    default: null,
                    keepOnSplit: false,
                    parseHTML: (element) => element.getAttribute('src'),
                },
                frameborder: {
                    default: 0,
                    keepOnSplit: false,
                    parseHTML: (element) => element.getAttribute('frameborder'),
                },
                width: {
                    default: '100%',
                    keepOnSplit: false,
                    parseHTML: (element) => element.getAttribute('width'),
                },
                height: {
                    default: null,
                    keepOnSplit: false,
                    parseHTML: (element) => element.getAttribute('height'),
                },
                allowfullscreen: {
                    keepOnSplit: false,
                    default: this.options.allowFullscreen,
                    parseHTML: (element) => element.getAttribute('allowfullscreen'),
                },
            };
        },

        renderHTML({HTMLAttributes}: Record<string, any>): DOMOutputSpec {
            return [
                'iframe',
                mergeAttributes(HTMLAttributes, {'data-type': 'iframe-editor'}),
            ];
        },

        addNodeView(): NodeViewRenderer {
          return AngularNodeViewRenderer(InsIframeEditor, { injector });
       },

        addCommands(): Partial<RawCommands> {
            return {
                setIframe:
                    (attrs) =>
                    ({commands, state}) => {
                        const prevLine = state.selection.anchor;

                        commands.enter();
                        commands.setTextSelection(prevLine);

                        commands.insertContent({
                            type: this.name,
                            attrs,
                        });

                        commands.setTextSelection(state.selection.anchor);

                        return true;
                    },
            };
        },
    });
