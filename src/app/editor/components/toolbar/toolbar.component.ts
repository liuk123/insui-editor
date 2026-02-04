import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';

import {
    InsAddRowTableButtonTool,
    InsAlignButtonTool,
    InsAnchorButtonTool,
    InsAttachButtonTool,
    InsBlockquoteButtonTool,
    InsClearButtonTool,
    InsCodeButtonTool,
    InsDetailsAddButtonTool,
    InsDetailsRemoveButtonTool,
    InsFontSizeButtonTool,
    InsFontStyleButtonTool,
    InsHeadingButtonTool,
    InsHighlightColorButtonTool,
    InsHrButtonTool,
    InsImageButtonTool,
    InsInsertGroupButtonTool,
    InsInsertTableButtonTool,
    InsLinkButtonTool,
    InsListButtonTool,
    InsPaintButtonTool,
    InsRedoButtonTool,
    InsRemoveGroupButtonTool,
    InsSubscriptButtonTool,
    InsSuperscriptButtonTool,
    InsTableMergeCellButtonTool,
    InsTexButtonTool,
    InsTextColorButtonTool,
    InsUndoButtonTool,
} from '../../tools';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { InsEditorTool, InsEditorToolType } from '../../common/editor-tool';
import { INS_EDITOR_DEFAULT_TOOLS } from '../../common/default-editor-tools';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { InsEditorAttachedFile } from '../../common/attached';

@Component({
    standalone: true,
    selector: 'ins-toolbar',
    imports: [
        InsAddRowTableButtonTool,
        InsAlignButtonTool,
        InsAnchorButtonTool,
        InsAttachButtonTool,
        InsBlockquoteButtonTool,
        InsClearButtonTool,
        InsCodeButtonTool,
        InsDetailsAddButtonTool,
        InsDetailsRemoveButtonTool,
        InsFontSizeButtonTool,
        InsFontStyleButtonTool,
        InsHighlightColorButtonTool,
        InsHrButtonTool,
        InsImageButtonTool,
        InsInsertGroupButtonTool,
        InsInsertTableButtonTool,
        InsLinkButtonTool,
        InsListButtonTool,
        InsPaintButtonTool,
        InsRedoButtonTool,
        InsRemoveGroupButtonTool,
        InsSubscriptButtonTool,
        InsSuperscriptButtonTool,
        InsTableMergeCellButtonTool,
        InsTexButtonTool,
        InsTextColorButtonTool,
        InsUndoButtonTool,
        InsHeadingButtonTool
    ],
    templateUrl: './toolbar.template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        insToolbar: '',
    },
})
export class InsToolbar {
    protected readonly options = inject(INS_EDITOR_OPTIONS);
    protected readonly tool: typeof InsEditorTool = InsEditorTool;
    protected toolsSet = new Set<InsEditorToolType>(INS_EDITOR_DEFAULT_TOOLS);

    @Input('editor')
    public editor: AbstractInsEditor | null = inject(InsTiptapEditorService, {
        optional: true,
    });

    @Output()
    public readonly linkAdded = new EventEmitter<string>();

    @Output()
    public readonly texClicked = new EventEmitter<void>();

    @Output()
    public readonly fileAttached = new EventEmitter<InsEditorAttachedFile[]>();

    public readonly el: HTMLElement | null =
        inject(ElementRef, {optional: true})?.nativeElement ?? null;

    @Input()
    public set tools(value: Set<InsEditorToolType> | readonly InsEditorToolType[]) {
        this.toolsSet = new Set(value);
    }

    protected get formatEnabled(): boolean {
        return (
            this.enabled(InsEditorTool.Bold) ||
            this.enabled(InsEditorTool.Italic) ||
            this.enabled(InsEditorTool.Underline) ||
            this.enabled(InsEditorTool.Strikethrough)
        );
    }

    protected get firstBigBlockEnabled(): boolean {
        return (
            this.formatEnabled ||
            this.enabled(InsEditorTool.Align) ||
            this.enabled(InsEditorTool.List) ||
            this.enabled(InsEditorTool.Quote) ||
            this.enabled(InsEditorTool.Link) ||
            this.enabled(InsEditorTool.Anchor) ||
            this.enabled(InsEditorTool.Attach)
        );
    }

    protected get secondBigBlockEnabled(): boolean {
        return (
            this.enabled(InsEditorTool.Code) ||
            this.enabled(InsEditorTool.Tex) ||
            this.enabled(InsEditorTool.Img) ||
            this.enabled(InsEditorTool.HR)
        );
    }

    protected enabled(tool: InsEditorToolType): boolean {
        return this.toolsSet.has(tool);
    }
}
