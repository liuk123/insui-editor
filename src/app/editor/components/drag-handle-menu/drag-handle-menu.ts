import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

interface MyCommand {
  name: string;
  icon?:string;
  key?: string;
  desc?: string;
  children?: MyCommand[]
}

@Component({
  selector: 'ins-drag-handle-menu',
  imports: [InsDataList],
  templateUrl: './drag-handle-menu.html',
  styleUrl: './drag-handle-menu.less',
})
export class DragHandleMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  items: MyCommand[] = [
    {
      name: '标题',
      key: 'heading',
      children: [
        {
          key: 'heading1',
          icon: 'heading-1',
          name: '一级标题',
        },
        {
          key: 'heading2',
          icon: 'heading-2',
          name: '二级标题',
        },
        {
          key: 'heading3',
          icon: 'heading-3',
          name: '三级标题',
        },
      ],
    },
    {
      name: '基础',
      key: 'base',
      children: [
        {
          key: 'paragraph',
          icon: 'pilcrow',
          name: '段落',
        },
        {
          key: 'quote',
          name: '引用',
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
        {
          key: 'divider',
          name: '分隔线',
        },
      ],
    },
    {
      name: '高级',
      key: 'advanced',
      children: [
        {
          key: 'table',
          name: '插入表格',
        },
      ],
    },
    {
      name: '媒体',
      key: 'media',
      children: [
        {
          key: 'image',
          name: '插入图片',
        },
      ],
    },


  ];
  protected command(command: MyCommand): void {
    const editor = this.editor?.getOriginTiptapEditor();

    if (!editor) {
      return;
    }
  }
}
