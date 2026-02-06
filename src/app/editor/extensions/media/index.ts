
import {mergeAttributes, Node} from '@tiptap/core';
import {type NodeSpec} from '@tiptap/pm/model';
import { insParseNodeAttributes } from '../../directives/tiptap-editor/utils/parse-node-attributes';
import { INS_DEFAULT_HTML5_MEDIA_ATTRIBUTES } from '../../common/default-html5-media-attributes';
import { insGetNestedNodes } from '../../directives/tiptap-editor/utils/get-nested-nodes';

export const InsAudio = Node.create({
    name: 'audio',
    group: 'block',
    content: 'source+',

    addAttributes() {
        return insParseNodeAttributes(INS_DEFAULT_HTML5_MEDIA_ATTRIBUTES);
    },

    parseHTML(): NodeSpec['parseDOM'] {
        return [{tag: 'audio'}];
    },

    renderHTML({node, HTMLAttributes}) {
        return ['audio', HTMLAttributes, ...insGetNestedNodes(node)];
    },
});

export const InsSource = Node.create({
    name: 'source',

    addAttributes() {
        return insParseNodeAttributes([
            'src',
            'type',
            'width',
            'height',
            'media',
            'sizes',
            'srcset',
        ]);
    },

    parseHTML(): NodeSpec['parseDOM'] {
        return [{tag: 'source'}];
    },

    renderHTML({HTMLAttributes}: Record<string, any>) {
        return ['source', mergeAttributes(HTMLAttributes)];
    },
});

export const InsVideo = Node.create({
    name: 'video',
    group: 'block',
    content: 'source+',

    addAttributes() {
        return insParseNodeAttributes(INS_DEFAULT_HTML5_MEDIA_ATTRIBUTES);
    },

    parseHTML(): NodeSpec['parseDOM'] {
        return [{tag: 'video'}];
    },

    renderHTML({node, HTMLAttributes}) {
        return ['video', HTMLAttributes, ...insGetNestedNodes(node)];
    },
});
