import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { InsDeleteLabel } from '../../../tools/label-buttons/delete';
import { InsClearLabel } from '../../../tools/label-buttons/clear';

@Component({
  selector: 'ins-drag-handle-menu',
  imports: [InsDataList, InsDeleteLabel, InsClearLabel],
  templateUrl: './drag-handle-menu.html',
  styleUrl: './drag-handle-menu.less',
})
export class InsDragHandleMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  get isDeleteGroup() {
    return this.editor?.isActive('group') ?? false;
  }
  get isDeleteTable() {
    return this.editor?.isActive('table') ?? false;
  }
  get isDeleteDetail() {
    return this.editor?.isActive('detail') ?? false;
  }
}
