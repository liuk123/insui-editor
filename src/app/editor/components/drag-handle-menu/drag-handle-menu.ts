import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

interface MyCommand {
  name: string;
  key: string;
  desc?: string;
}

@Component({
  selector: 'ins-drag-handle-menu',
  imports: [
    InsDataList
  ],
  templateUrl: './drag-handle-menu.html',
  styleUrl: './drag-handle-menu.less',
})
export class DragHandleMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  items = [
    {
      key: 'heading1',
      name: '一级标题',
    },
    {
      key: 'heading2',
      name: '二级标题',
    },
    {
      key: 'heading3',
      name: '三级标题',
    },
    {
      key: 'table',
      name: '插入表格',
    },
    {
      key: 'image',
      name: '插入图片',
    },
    {
      key: 'bulletList',
      name: '无序列表',
    },
    {
      key: 'orderedList',
      name: '有序列表',
    },
    {
      key: 'taskList',
      name: '任务列表',
    },
    {
      key: 'codeBlock',
      name: '代码块',
    },
  ];
  protected command(command: MyCommand): void {
    const editor = this.editor?.getOriginTiptapEditor();

    if (!editor) {
      return;
    }
  }
}
