
import { Injector } from '@angular/core';
import { Node, NodeViewRenderer } from '@tiptap/core';
import { Table } from '@tiptap/extension-table';
import { AngularNodeViewRenderer } from '../tiptap-node-view';
import { InsTableHandles } from './table-handles.component';

export interface InsTableHandlesOptions {
    injector: Injector;
    resizable?: boolean;
    lastColumnResizable?:boolean
    allowTableNodeSelection?:boolean
}

export function insCreateTableHandlesExtension({
    injector,
    resizable,
    lastColumnResizable,
    allowTableNodeSelection
}: InsTableHandlesOptions): Node {
    return Table.configure({
        resizable: resizable ?? true,
        lastColumnResizable: lastColumnResizable ?? true,
        allowTableNodeSelection: allowTableNodeSelection ?? true,
    }).extend({
        addNodeView(): NodeViewRenderer {
            return AngularNodeViewRenderer(InsTableHandles, {
                injector,
                contentDOMElementTag: 'tbody',
                attrs: {
                    // Pass attributes if needed
                }
            });
        },
    });
}
