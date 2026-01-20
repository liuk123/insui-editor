import {ChangeDetectionStrategy, Component} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';

@Component({
    standalone: true,
    selector: 'button[insFontSizeTool]',
    imports: [
        AsyncPipe,
        LowerCasePipe,
        NgClass,
        NgForOf,
        NgStyle,
        InsDataList,
        InsItem,
        InsOption,
        InsTextfield,
    ],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
                <button
                    *ngFor="let item of fontsOptions$ | async"
                    insItem
                    insOption
                    type="button"
                    [attr.automation-id]="'ins_font__' + (item.name || '' | lowercase)"
                    [ngClass]="item?.ngClass || {}"
                    [ngStyle]="item?.ngStyle || {}"
                    [style.font-family]="item.family"
                    [style.font-size.px]="item.px"
                    [style.font-weight]="item.weight"
                    (click)="setFontOption(item)"
                >
                    {{ item.name }}
                </button>
            </ins-data-list>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
    host: {
        '[attr.automation-id]': '"toolbar__font-size-button"',
    },
})
export class InsFontSizeButtonTool extends InsToolbarTool {
    protected readonly dropdown = insDropdown(null);
    protected readonly open = insDropdownOpen();

    protected readonly fontsOptions$ = inject(TUI_EDITOR_FONT_OPTIONS).pipe(
        map((texts) => this.options.fontOptions(texts)),
    );

    @ViewChild(forwardRef(() => InsTextfieldDropdownDirective), {read: TemplateRef})
    protected set template(template: PolymorpheusContent) {
        this.dropdown.set(template);
    }

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.fontSize;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return this.open() ? '' : (texts?.font ?? '');
    }

    protected setFontOption({headingLevel, px}: Partial<InsEditorFontOption>): void {
        const color = this.editor?.getFontColor() ?? EDITOR_BLANK_COLOR;

        this.clearPreviousTextStyles();

        if (headingLevel) {
            this.editor?.setHeading(headingLevel);
        } else {
            this.editor?.setParagraph({fontSize: insPx(px ?? 0)});
        }

        if (color !== EDITOR_BLANK_COLOR) {
            this.editor?.setFontColor(color);
        }
    }

    private clearPreviousTextStyles(): void {
        this.editor?.removeEmptyTextStyle();
        this.editor?.toggleMark('textStyle');
    }
}
