import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insTexTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'texClicked?.emit()',
    },
})
export class InsTexButtonTool extends InsToolbarTool {
    @Output()
    public readonly texClicked = new EventEmitter<void>();

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.tex;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.tex ?? '';
    }
}
