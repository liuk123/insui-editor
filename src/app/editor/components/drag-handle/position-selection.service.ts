import { effect, inject, Injectable, signal } from '@angular/core';
import { EditorView } from '@tiptap/pm/view';
import { Fragment, Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { MultipleNodeSelection } from './MultipleNodeSelection';
import { getHTMLFromFragment } from '@tiptap/core';
import { ActiveNodePath } from '../../common/editor-adapter';
import { INS_EDITOR_OPTIONS, InsEditorOptions } from '../../common/editor-options';

@Injectable({ providedIn: 'root' })
export class PositionSelectionService {
  public readonly visible = signal(false);
  public readonly top = signal(0);
  public readonly left = signal(0);
  public activeNode = signal<ActiveNodePath | null>(null);
  public activeIcon = signal<string>('plus');

  private readonly options = inject(INS_EDITOR_OPTIONS);

  view: EditorView | null = null;

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
      'video',
      'audio',
      'table',
    ];
    return allowedNodes.includes(nodeName);
  };
  public refreshActiveNode(view: EditorView, path: ActiveNodePath[]) {
    this.view = view;
    let item =
      path.find((v, index) => {
        if (v.node === 'listItem' || v.node === 'taskItem') {
          return true;
        }
        if (index === path.length - 1 && this.nodeFilter(v.node)) {
          return true;
        }
        return false;
      }) || null;
    if (item) {
      this.activeNode.set(item);
    }
  }
  constructor() {
    effect(() => {
      let item = this.activeNode();
      this.updatePositionForSelection(item?.node, item?.nodePos);
      if(item){
        this.activeIcon.set(this.resolveInsertIcon(item));
      }
    });
  }

  public updatePositionForSelection(node: string | undefined, nodePos: number | undefined) {
    if (!node || !this.view || nodePos == undefined) {
      this.visible.set(false);
      return;
    }
    // 获取该节点真实 DOM
    const domNode = this.view.nodeDOM(nodePos) as HTMLElement;
    if (!domNode || domNode.nodeType !== 1) {
      this.visible.set(false);
      return;
    }

    const rect = domNode.getBoundingClientRect();
    const container = this.view.dom.parentElement;
    if (!container) {
      this.visible.set(false);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;

    this.top.set(rect.top - containerRect.top + scrollTop);
    this.left.set(rect.left - containerRect.left + scrollLeft - 64);
    this.visible.set(true);
  }

  public onDragStart(event: DragEvent) {
    if (!this.view) {
      return;
    }

    let { node, nodePos } = this.activeNode() || {};
    if (nodePos == undefined || !node) return;

    const selection = this.view.state.selection;

    let slice = null as any;
    let sliceFrom = -1;
    let sliceTo = -1;
    let listParentNodeForHtml: ProseMirrorNode | null = null;

    const multipleBlocksSelected =
      selection.$anchor.node() !== selection.$head.node() ||
      selection instanceof MultipleNodeSelection;
    if (multipleBlocksSelected) {
      const fromListDepth = this.findListItemDepth(selection.$from);
      const toListDepth = this.findListItemDepth(selection.$to);
      const listDepth =
        fromListDepth &&
        toListDepth &&
        fromListDepth === toListDepth &&
        selection.$from.node(fromListDepth - 1).eq(selection.$to.node(toListDepth - 1))
          ? fromListDepth
          : 1;

      sliceFrom = selection.$from.before(listDepth);
      sliceTo = selection.$to.after(listDepth);

      this.view.dispatch(
        this.view.state.tr.setSelection(
          MultipleNodeSelection.create(this.view.state.doc, sliceFrom, sliceTo),
        ),
      );
      slice = this.view.state.doc.slice(sliceFrom, sliceTo);

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
      const nodeSelection = NodeSelection.create(this.view.state.doc, nodePos);
      this.view.dispatch(this.view.state.tr.setSelection(nodeSelection));
      slice = nodeSelection.content();
      sliceFrom = nodeSelection.from;
      sliceTo = nodeSelection.to;

      if (
        nodeSelection.node.type.name === 'listItem' ||
        nodeSelection.node.type.name === 'taskItem'
      ) {
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

    (this.view as any).dragging = { slice, move: true };

    if (event.dataTransfer) {
      const dragDom = this.view.nodeDOM(nodePos);
      if (dragDom && dragDom.nodeType === 1) {
        event.dataTransfer.setDragImage(dragDom as HTMLElement, 0, 0);
      }

      event.dataTransfer.effectAllowed = 'move';

      const fragmentForHtml = listParentNodeForHtml
        ? Fragment.from(
            listParentNodeForHtml.type.create(listParentNodeForHtml.attrs, slice.content),
          )
        : slice.content;

      event.dataTransfer.setData(
        'text/html',
        getHTMLFromFragment(fragmentForHtml, this.view.state.schema),
      );
      event.dataTransfer.setData(
        'text/plain',
        this.view.state.doc.textBetween(sliceFrom, sliceTo, '\n\n') || '',
      );
    }
  }

  findListItemDepth(pos: ResolvedPos): number | null {
    for (let d = pos.depth; d > 0; d--) {
      const name = pos.node(d).type.name;
      if (name === 'listItem' || name === 'taskItem') return d;
    }
    return null;
  }
  findActiveNode($pos: ResolvedPos) {
    let node = null;
    let nodePos = -1;

    for (let d = $pos.depth; d > 0; d--) {
      const parent = $pos.node(d);
      const nodeName = parent.type.name;
      if (d === 1 && parent.isBlock && this.nodeFilter(nodeName)) {
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
    return { node, nodePos };
  }

  private resolveInsertIcon(path: ActiveNodePath): string {
    const icons = this.options.icons as InsEditorOptions['icons'];
    const nodeName = path.node;

    if (nodeName === 'heading') {
      const level = Number(path.attrs?.['level']);
      if (level >= 1 && level <= 6) {
        return icons[`heading${level}` as keyof InsEditorOptions['icons']] as string;
      }
      return icons.header;
    }

    if (nodeName === 'paragraph') return icons.paragraph;
    if (nodeName === 'bulletList') return icons.listUnOrdered;
    if (nodeName === 'orderedList') return icons.listOrdered;
    if (nodeName === 'taskList' || nodeName === 'taskItem') return icons.taskList;
    if (nodeName === 'listItem') return icons.listPreview;
    if (nodeName === 'blockquote') return icons.quote;
    if (nodeName === 'codeBlock') return icons.codeBlock;
    if (nodeName === 'image' || nodeName === 'video' || nodeName === 'audio') return icons.image;
    if (nodeName === 'table') return icons.insertTable;

    return icons.groupAdd || 'plus';
  }
}
