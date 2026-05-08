import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { InsTableAlignButtonLabel } from '../../../tools/label-buttons/align-table';
import { InsTableColAddAfterLabel } from '../../../tools/label-buttons/table-col-add-after';
import { InsTableColAddBeforeLabel } from '../../../tools/label-buttons/table-col-add-before';
import { InsTableColDeleteLabel } from '../../../tools/label-buttons/table-col-delete';
import { InsTableColorButtonLabel } from '../../../tools/label-buttons/color-table';
import { InsTableCellClearLabel } from '../../../tools/label-buttons/table-cell-clear';

@Component({
  selector: 'ins-table-col-menu',
  imports: [
    InsDataList,
    InsTableColAddBeforeLabel,
    InsTableColAddAfterLabel,
    InsTableColorButtonLabel,
    InsTableAlignButtonLabel,
    InsTableColDeleteLabel,
    InsTableCellClearLabel,
  ],
  templateUrl: './table-col-menu.html',
  styleUrl: './table-col-menu.less',
})
export class TableColMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
}
