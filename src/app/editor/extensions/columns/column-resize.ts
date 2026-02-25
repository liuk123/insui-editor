import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

export const ColumnResize = Extension.create({
  name: 'columnResize',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('columnResize'),
        view: (view) => new ColumnResizeView(view),
      }),
    ];
  },
});

class ColumnResizeView {
  view: EditorView;
  resizing: boolean = false;
  startX: number = 0;
  startLeftWidth: number = 0;
  startRightWidth: number = 0;
  startLeftWidthPx: number = 0;
  startRightWidthPx: number = 0;
  leftColumn: { node: ProseMirrorNode; pos: number; dom: HTMLElement } | null = null;
  rightColumn: { node: ProseMirrorNode; pos: number; dom: HTMLElement } | null = null;

  constructor(view: EditorView) {
    this.view = view;
    // Bind handlers
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.view.dom.addEventListener('mousemove', this.handleMouseMove);
    this.view.dom.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  destroy() {
    this.view.dom.removeEventListener('mousemove', this.handleMouseMove);
    this.view.dom.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove(event: MouseEvent) {
    if (this.resizing) {
      this.handleResize(event);
      return;
    }

    const target = event.target as HTMLElement;
    const column = target.closest('[data-type="column"]') as HTMLElement;

    if (!column) {
      this.view.dom.style.cursor = '';
      return;
    }

    const rect = column.getBoundingClientRect();
    const isNearRight = Math.abs(event.clientX - rect.right) < 10;
    const isNearLeft = Math.abs(event.clientX - rect.left) < 10;

    if (isNearRight && column.nextElementSibling?.getAttribute('data-type') === 'column') {
      this.view.dom.style.cursor = 'col-resize';
    } else if (isNearLeft && column.previousElementSibling?.getAttribute('data-type') === 'column') {
      this.view.dom.style.cursor = 'col-resize';
    } else {
      this.view.dom.style.cursor = '';
    }
  }

  handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const column = target.closest('[data-type="column"]') as HTMLElement;

    if (!column) return;

    const rect = column.getBoundingClientRect();
    const isNearRight = Math.abs(event.clientX - rect.right) < 10;
    const isNearLeft = Math.abs(event.clientX - rect.left) < 10;

    if (isNearRight && column.nextElementSibling?.getAttribute('data-type') === 'column') {
      this.startResize(event, column, column.nextElementSibling as HTMLElement);
    } else if (isNearLeft && column.previousElementSibling?.getAttribute('data-type') === 'column') {
      this.startResize(event, column.previousElementSibling as HTMLElement, column);
    }
  }

  startResize(event: MouseEvent, left: HTMLElement, right: HTMLElement) {
    event.preventDefault();
    this.resizing = true;
    this.startX = event.clientX;

    const leftPosInside = this.view.posAtDOM(left, 0);
    const leftNodePos = leftPosInside - 1;
    const leftNode = this.view.state.doc.nodeAt(leftNodePos);

    const rightPosInside = this.view.posAtDOM(right, 0);
    const rightNodePos = rightPosInside - 1;
    const rightNode = this.view.state.doc.nodeAt(rightNodePos);

    if (
      !leftNode ||
      !rightNode ||
      leftNode.type.name !== 'column' ||
      rightNode.type.name !== 'column'
    ) {
      this.resizing = false;
      return;
    }

    this.leftColumn = { node: leftNode, pos: leftNodePos, dom: left };
    this.rightColumn = { node: rightNode, pos: rightNodePos, dom: right };

    this.startLeftWidth = leftNode.attrs['width'] || 1;
    this.startRightWidth = rightNode.attrs['width'] || 1;
    this.startLeftWidthPx = left.getBoundingClientRect().width;
    this.startRightWidthPx = right.getBoundingClientRect().width;
  }

  handleResize(event: MouseEvent) {
    if (!this.resizing || !this.leftColumn || !this.rightColumn) return;

    const diff = event.clientX - this.startX;

    const totalWidthPx = this.startLeftWidthPx + this.startRightWidthPx;
    const newLeftWidthPx = this.startLeftWidthPx + diff;
    const newRightWidthPx = this.startRightWidthPx - diff;

    const totalFlex = this.startLeftWidth + this.startRightWidth;
    const newLeftFlex = (newLeftWidthPx / totalWidthPx) * totalFlex;
    const newRightFlex = (newRightWidthPx / totalWidthPx) * totalFlex;

    if (newLeftFlex > 0.1 && newRightFlex > 0.1) {
      this.view.dispatch(
        this.view.state.tr
          .setNodeAttribute(this.leftColumn.pos, 'width', newLeftFlex)
          .setNodeAttribute(this.rightColumn.pos, 'width', newRightFlex)
      );
    }
  }

  handleMouseUp() {
    this.resizing = false;
    this.view.dom.style.cursor = '';
    this.leftColumn = null;
    this.rightColumn = null;
  }
}
