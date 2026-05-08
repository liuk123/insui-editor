import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
    standalone: true,
    selector: 'button[insTableMergeCellLabel]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [],
    host: {
        '(click)': 'canMergeCells?.() ? editor?.mergeCells() : editor?.splitCell()',
    },
})
export class InsTableMergeCellLabel extends InsToolbarBase {
    protected readonly canMergeCells? = signal<boolean>(false);

    constructor() {
        super();
        this.editorChange$.subscribe(() => {
            this.canMergeCells?.set(this.editor?.canMergeCells() ?? false);
        });
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
