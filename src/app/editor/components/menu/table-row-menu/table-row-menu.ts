import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { InsTableColorButtonLabel } from '../../../tools/label-buttons/color-table';

@Component({
  selector: 'ins-table-row-menu',
  imports: [
    InsDataList,
    InsTableColorButtonLabel
  ],
  templateUrl: './table-row-menu.html',
  styleUrl: './table-row-menu.less',
})
export class TableRowMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
}
