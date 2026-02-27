import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  NgZone,
  input,
  TemplateRef,
} from '@angular/core';
import { InsButton, InsDropdown } from '@liuk123/insui';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { getHTMLFromFragment } from '@tiptap/core';
import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { MultipleNodeSelection } from './MultipleNodeSelection';

@Component({
  selector: 'ins-drag-handle',
  imports: [InsButton, InsDropdown],
  templateUrl: './drag-handle.html',
  styleUrl: './drag-handle.less',
  host: {
    '[style.top.px]': 'top()',
    '[style.left.px]': 'left()',
    '[class.visible]': 'visible()',
  },
})
export class InsDragHandle implements OnInit, OnDestroy {
  private readonly editorService = inject(InsTiptapEditorService);
  private readonly zone = inject(NgZone);

  public readonly visible = signal(false);
  public readonly top = signal(0);
  public readonly left = signal(0);
  public readonly activeNode = signal<ProseMirrorNode | null>(null);

  private currentPos: number | null = null;
  private currentNode: ProseMirrorNode | null = null;
  private pluginKey = new PluginKey('ins-drag-handle');
  private isDraggingFromHandle = false;
  protected insertOpen=signal(false)
  protected dragOpen=signal(false)

  get editor() {
    return this.editorService.getOriginTiptapEditor();
  }
  nodeFilter = (nodeName: string) => {
    // 自定义可拖拽节点类型
    const allowedNodes = [
      'paragraph',
      'heading',
      'blockquote',
      'codeBlock',
      'bulletList',
      'orderedList',
      'taskList',
      'image',
      'table',
    ];
    return allowedNodes.includes(nodeName);
  }

  public readonly dragHandleContent = input<TemplateRef<any> | null>(null);
  public readonly insertHandleContent = input<TemplateRef<any> | null>(null);
  // Menu Items Logic
  // public readonly menuItems = computed(() => {
  //   const node = this.activeNode();
  //   const items = [
  //     { label: '删除', action: 'delete' },
  //     { label: '复制', action: 'duplicate' },
  //   ];

  //   if (node?.type.name === 'heading') {
  //     items.push({ label: '转为段落', action: 'turn-to-paragraph' });
  //   } else if (node?.type.name === 'paragraph') {
  //     items.push({ label: '转为标题 1', action: 'turn-to-h1' });
  //     items.push({ label: '转为标题 2', action: 'turn-to-h2' });
  //   }

  //   return items;
  // });

  ngOnInit(): void {
    this.registerPlugin();
  }

  ngOnDestroy(): void {
    if (this.editor && !this.editor.isDestroyed) {
      this.editor?.unregisterPlugin(this.pluginKey);
    }
  }

  private registerPlugin() {
    if (!this.editor) return;

    this.editor.registerPlugin(
      new Plugin({
        key: this.pluginKey,
        view: (view) => {
          return {
            update: (view, prevState) => {
              // Update if document or selection changed
              if (
                !view.state.doc.eq(prevState.doc) ||
                !view.state.selection.eq(prevState.selection)
              ) {
                this.updatePositionForSelection(view, this.nodeFilter);
              }
            },
          };
        },
        props: {
          handleDOMEvents: {
            drop: (view: EditorView, event: DragEvent) => {
              if (!this.isDraggingFromHandle) {
                return false;
              }

              setTimeout(() => {
                const editor = this.editorService.getOriginTiptapEditor();
                if (!editor) return;

                const { selection } = editor.state;
                if (!(selection instanceof NodeSelection) && !(selection instanceof MultipleNodeSelection)) {
                  this.isDraggingFromHandle = false;
                  return;
                }

                const node =
                  selection instanceof NodeSelection
                    ? selection.node
                    : editor.state.doc.nodeAt(selection.from);
                const pos = selection.from + (node?.isTextblock ? 1 : 0);

                this.editorService.setTextSelection(pos);
                this.isDraggingFromHandle = false;
              });

              return false;
            },
            // Keep mouse interaction logic if needed for hover effects in future
            // For now, we rely on view updates for positioning based on selection
          },
        },
      }),
    );
  }

  private updatePositionForSelection(view: EditorView, nodeFilter: (nodeName: string) => boolean) {
    if (!view.editable) return;

    const selection = view.state.selection;
    if (!selection) return;

    const $pos = selection.$from;
    let node = null;
    let nodePos = -1;

    for (let d = $pos.depth; d > 0; d--) {
      const parent = $pos.node(d);
      const nodeName = parent.type.name;
      if (d === 1 && parent.isBlock && nodeFilter(nodeName)) {
        node = parent;
        nodePos = $pos.before(d);
        break;
      }
      if (nodeName === 'listItem' || nodeName === 'taskItem') {
        node = parent;
        nodePos = $pos.before(d);
        break;
      }
    }

    if (!node || !node.isBlock || node === view.state.doc) {
      this.visible.set(false);
      return;
    }

    const domNode = view.nodeDOM(nodePos) as HTMLElement;
    if (!domNode || domNode.nodeType !== 1) {
      this.visible.set(false);
      return;
    }

    const rect = domNode.getBoundingClientRect();
    const container = view.dom.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;

    this.zone.run(() => {
      this.currentPos = nodePos;
      this.currentNode = node;
      this.activeNode.set(node);

      this.top.set(rect.top - containerRect.top + scrollTop);
      this.left.set(rect.left - containerRect.left + scrollLeft - 45);

      this.visible.set(true);
    });
  }

  public onDragStart(event: DragEvent) {
    if (this.currentPos === null || !this.currentNode) return;

    this.isDraggingFromHandle = true;

    const view = this.editorService?.view;
    if (!view) return;

    const selection = view.state.selection;

    const findListItemDepth = (pos: typeof selection.$from): number | null => {
      for (let d = pos.depth; d > 0; d--) {
        const name = pos.node(d).type.name;
        if (name === 'listItem' || name === 'taskItem') return d;
      }
      return null;
    };

    let slice = null as any;
    let sliceFrom = -1;
    let sliceTo = -1;
    let listParentNodeForHtml: ProseMirrorNode | null = null;

    const multipleBlocksSelected =
      selection.$anchor.node() !== selection.$head.node() ||
      selection instanceof MultipleNodeSelection;

    if (multipleBlocksSelected) {
      const fromListDepth = findListItemDepth(selection.$from);
      const toListDepth = findListItemDepth(selection.$to);
      const listDepth =
        fromListDepth &&
        toListDepth &&
        fromListDepth === toListDepth &&
        selection.$from.node(fromListDepth - 1).eq(selection.$to.node(toListDepth - 1))
          ? fromListDepth
          : 1;

      sliceFrom = selection.$from.before(listDepth);
      sliceTo = selection.$to.after(listDepth);

      view.dispatch(
        view.state.tr.setSelection(
          MultipleNodeSelection.create(view.state.doc, sliceFrom, sliceTo),
        ),
      );

      slice = view.state.doc.slice(sliceFrom, sliceTo);

      if (listDepth > 1) {
        const parent = selection.$from.node(listDepth - 1);
        if (
          parent.type.name === 'bulletList' ||
          parent.type.name === 'orderedList' ||
          parent.type.name === 'taskList'
        ) {
          listParentNodeForHtml = parent;
        }
      }
    } else {
      const nodeSelection = NodeSelection.create(view.state.doc, this.currentPos);
      view.dispatch(view.state.tr.setSelection(nodeSelection));
      slice = nodeSelection.content();
      sliceFrom = nodeSelection.from;
      sliceTo = nodeSelection.to;

      if (nodeSelection.node.type.name === 'listItem' || nodeSelection.node.type.name === 'taskItem') {
        const parent = nodeSelection.$from.parent;
        if (
          parent.type.name === 'bulletList' ||
          parent.type.name === 'orderedList' ||
          parent.type.name === 'taskList'
        ) {
          listParentNodeForHtml = parent;
        }
      }
    }

    (view as any).dragging = { slice, move: true };

    if (event.dataTransfer) {
      const dragDom = view.nodeDOM(this.currentPos);
      if (dragDom && dragDom.nodeType === 1) {
        event.dataTransfer.setDragImage(dragDom as HTMLElement, 0, 0);
      }

      event.dataTransfer.effectAllowed = 'copyMove';

      const fragmentForHtml = listParentNodeForHtml
        ? Fragment.from(listParentNodeForHtml.type.create(listParentNodeForHtml.attrs, slice.content))
        : slice.content;

      event.dataTransfer.setData('text/html', getHTMLFromFragment(fragmentForHtml, view.state.schema));
      event.dataTransfer.setData('text/plain', view.state.doc.textBetween(sliceFrom, sliceTo, '\n\n') || '');
    }
  }

  // public onMenuAction(action: string) {
  //   if (this.currentPos === null || !this.currentNode) return;
  //   const editor = this.editorService.getOriginTiptapEditor();
  //   if (!editor) return;

  //   // Select the target node first
  //   editor.commands.setNodeSelection(this.currentPos);

  //   switch (action) {
  //     case 'delete':
  //       editor.chain().deleteSelection().run();
  //       break;
  //     case 'duplicate':
  //       // Logic to duplicate the node
  //       const selection = NodeSelection.create(editor.state.doc, this.currentPos);
  //       const slice = selection.content();
  //       editor
  //         .chain()
  //         .insertContentAt(this.currentPos + selection.node.nodeSize, slice.content)
  //         .run();
  //       break;
  //     case 'turn-to-paragraph':
  //       editor.chain().setParagraph().run();
  //       break;
  //     case 'turn-to-h1':
  //       editor.chain().toggleHeading({ level: 1 }).run();
  //       break;
  //     case 'turn-to-h2':
  //       editor.chain().toggleHeading({ level: 2 }).run();
  //       break;
  //   }
  //   this.visible.set(false);
  // }
}
