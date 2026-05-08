import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { InsTableAlignButtonLabel } from '../../../tools/label-buttons/align-table';
import { InsTableColorButtonLabel } from '../../../tools/label-buttons/color-table';
import { InsTableRowAddAfterLabel } from '../../../tools/label-buttons/table-row-add-after';
import { InsTableRowAddBeforeLabel } from '../../../tools/label-buttons/table-row-add-before';
import { InsTableRowClearLabel } from '../../../tools/label-buttons/table-row-clear';
import { InsTableRowDeleteLabel } from '../../../tools/label-buttons/table-row-delete';

@Component({
  selector: 'ins-table-row-menu',
  imports: [
    InsDataList,
    InsTableRowAddBeforeLabel,
    InsTableRowAddAfterLabel,
    InsTableRowDeleteLabel,
    InsTableRowClearLabel,
    InsTableColorButtonLabel,
    InsTableAlignButtonLabel,
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
