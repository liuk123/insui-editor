import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { InsTableAlignButtonLabel } from '../../../tools/label-buttons/align-table';
import { InsTableCellClearLabel } from '../../../tools/label-buttons/table-cell-clear';
import { InsTableColorButtonLabel } from '../../../tools/label-buttons/color-table';
import { InsTableMergeCellButtonTool } from '../../../tools/tool-buttons/table-merge-cell';
import { InsTableMergeCellLabel } from '../../../tools/label-buttons/table-merge-cell';

@Component({
  selector: 'ins-table-cell-menu',
  imports: [
    InsDataList,
    InsTableColorButtonLabel,
    InsTableAlignButtonLabel,
    InsTableMergeCellLabel,
    InsTableCellClearLabel,
  ],
  templateUrl: './table-cell-menu.html',
  styleUrl: './table-cell-menu.less',
})
export class TableCellMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
}
