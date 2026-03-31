import { Component, inject, Input } from '@angular/core';
import { InsDataList } from '@liuk123/insui';
import { AbstractInsEditor } from '../../../common/editor-adapter';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';
import { InsHeadNButtonLabel } from '../../../tools/label-buttons/head';
import { InsBlockquoteLabel } from '../../../tools/label-buttons/quote';
import { InsUnorderedListButtonLabel } from '../../../tools/label-buttons/unordered-list';
import { InsCodeBlockButtonLabel } from '../../../tools/label-buttons/codeBlock';
import { InsHrButtonLabel } from '../../../tools/label-buttons/hr';
import { InsInsertTableButtonLabel } from '../../../tools/label-buttons/insert-table';
import { InsImageButtonLabel } from '../../../tools/label-buttons/image';

@Component({
  selector: 'ins-insert-handle-menu',
  imports: [
    InsDataList,
    InsHeadNButtonLabel,
    InsBlockquoteLabel,
    InsUnorderedListButtonLabel,
    InsCodeBlockButtonLabel,
    InsHrButtonLabel,
    InsInsertTableButtonLabel,
    InsImageButtonLabel
  ],
  templateUrl: './insert-handle-menu.html',
  styleUrl: './insert-handle-menu.less',
})
export class InsInsertHandleMenu {
  @Input('editor')
  public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
}
