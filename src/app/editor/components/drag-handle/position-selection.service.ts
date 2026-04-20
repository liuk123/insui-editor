import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { EditorView } from '@tiptap/pm/view';
import { Fragment, Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { MultipleNodeSelection } from './MultipleNodeSelection';
import { getHTMLFromFragment } from '@tiptap/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class PositionSelectionService {

  private readonly destroyRef = inject(DestroyRef);
  public activeNode$ = new BehaviorSubject<{ node: ProseMirrorNode | null; nodePos: number }>({
    node: null,
    nodePos: -1,
  });
  public readonly visible = signal(false);
  public readonly top = signal(0);
  public readonly left = signal(0);

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

  public setActiveNode(view: EditorView | null) {
    this.view = view;
    if (!this.view) return;
    const selection = this.view.state.selection;
    if (!selection) return;
    let { node, nodePos } = this.findActiveNode(selection.$from);
    this.activeNode$.next({ node, nodePos });
  }

  constructor() {
    this.activeNode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ node, nodePos }) => {
      this.updatePositionForSelection(node, nodePos);
    });
  }

  public updatePositionForSelection(node: ProseMirrorNode | null, nodePos: number) {
    if (!node || !this.view) {
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
    let { node, nodePos } = this.activeNode$.getValue();
    if (nodePos < 0 || !node) return;

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

    (this.view as any).dragging = { slice, move: true };

    if (event.dataTransfer) {
      const dragDom = this.view.nodeDOM(nodePos);
      if (dragDom && dragDom.nodeType === 1) {
        event.dataTransfer.setDragImage(dragDom as HTMLElement, 0, 0);
      }

      event.dataTransfer.effectAllowed = 'move';

      const fragmentForHtml = listParentNodeForHtml
        ? Fragment.from(listParentNodeForHtml.type.create(listParentNodeForHtml.attrs, slice.content))
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
  };
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
}
