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
import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

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
                if (!(selection instanceof NodeSelection)) {
                  this.isDraggingFromHandle = false;
                  return;
                }

                const pos =
                  selection.from + (selection.node.isTextblock ? 1 : 0);

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

    const selection = NodeSelection.create(view.state.doc, this.currentPos);
    view.dispatch(view.state.tr.setSelection(selection));

    // Create a slice for the drag
    const slice = selection.content();

    // Set dragging flag on view
    (view as any).dragging = { slice, move: true };

    if (event.dataTransfer) {
      const node = view.nodeDOM(this.currentPos);
      if (node && node.nodeType === 1) {
        event.dataTransfer.setDragImage(node as HTMLElement, 0, 0);
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.setData('text/html', (node as HTMLElement).outerHTML);
        event.dataTransfer.setData('text/plain', this.currentNode.textContent || '');
      }
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
