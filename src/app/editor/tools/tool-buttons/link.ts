import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';

@Component({
    standalone: true,
    selector: 'button[insLinkTool]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '[attr.automation-id]': '"toolbar__link-button"',
        '(click)': 'onLink()',
        '[attr.title]': 'insHint()'
    },
})
export class InsLinkButtonTool extends InsToolbarTool {
    protected override isActive(): boolean {
        return this.editor?.isActive('link') ?? false;
    }

    protected override getDisableState(): boolean {
        return (
            (this.editor?.isActive('link') ?? false) ||
            (this.editor?.isActive('jumpAnchor') ?? false) ||
            (this.editor?.isActive('image', {'data-editing-href': true}) ?? false)
        );
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.link;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.link ?? '';
    }

    protected onLink(url?: string): void {
        this.editor?.takeSelectionSnapshot();
        this.editor?.toggleLink(url ?? '');
    }
}
