import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { insGetCurrentWordBounds } from '../../directives/tiptap-editor/utils/get-current-word-bounds';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insAnchorTool]',
    template: '{{ insHint() }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'onAnchor()',
    },
})
export class InsAnchorButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('jumpAnchor') ?? false;
    }

    protected override getDisableState(): boolean {
        return (
            (this.editor?.isActive('link') ?? false) ||
            (this.editor?.isActive('jumpAnchor') ?? false) ||
            (this.editor?.isActive('image') ?? false)
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.anchor;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.insertAnchor ?? '';
    }

    protected onAnchor(): void {
        this.editor?.takeSelectionSnapshot();

        const range = this.editor?.getSelectionSnapshot();
        const editor = this.editor?.getOriginTiptapEditor();
        const {from = range?.anchor} = editor ? insGetCurrentWordBounds(editor) : {};

        this.editor?.setAnchor('');
        this.editor?.getOriginTiptapEditor()?.commands.focus((from ?? 0) + 1);
    }
}
