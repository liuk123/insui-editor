import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insTableMergeCellTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'canMergeCells?.() ? editor?.mergeCells() : editor?.splitCell()',
    },
})
export class InsTableMergeCellButtonTool extends InsToolbarTool {
    protected readonly canMergeCells? = signal<boolean>(false);

    protected override updateSignals(): void {
        this.canMergeCells?.set(this.editor?.canMergeCells() ?? false);

        super.updateSignals();
    }

    protected override getDisableState(): boolean {
        return (
            !(this.editor?.canMergeCells() ?? false) &&
            !(this.editor?.canSplitCells() ?? false)
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return this.canMergeCells?.() ? icons.tableCellMerge : icons.tableCellSplit;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return this.canMergeCells?.()
            ? (texts?.mergeCells ?? '')
            : (texts?.splitCells ?? '');
    }
}
