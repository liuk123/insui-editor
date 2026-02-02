import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
} from '@angular/core';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { InsButton } from '@liuk123/insui';


@Component({
    standalone: true,
    selector: 'ins-image-align-list',
    imports: [InsButton],
    template: `
        <button
            aria-label="Justify align"
            size="xs"
            title=""
            insIconButton
            type="button"
            [appearance]="isAlignJustify(style) ? 'outline' : 'flat'"
            [iconStart]="options.icons.imageExtension.alignJustify"
            (click.capture)="alignJustify()"
        >
            Justify align
        </button>
        <button
            aria-label="Align left"
            size="xs"
            insIconButton
            type="button"
            [appearance]="isAlignLeft(style) ? 'outline' : 'flat'"
            [iconStart]="options.icons.imageExtension.alignLeft"
            (click.capture)="alignLeft()"
        >
            Left align
        </button>
        <button
            aria-label="Align center"
            size="xs"
            insIconButton
            type="button"
            [appearance]="isAlignCenter(style) ? 'outline' : 'flat'"
            [iconStart]="options.icons.imageExtension.alignCenter"
            (click.capture)="alignCenter()"
        >
            Center align
        </button>
        <button
            aria-label="Align right"
            size="xs"
            insIconButton
            type="button"
            [appearance]="isAlignRight(style) ? 'outline' : 'flat'"
            [iconStart]="options.icons.imageExtension.alignRight"
            (click.capture)="alignRight()"
        >
            Right align
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsImageAlignList {
    protected readonly options = inject(INS_EDITOR_OPTIONS);

    @Input()
    public style?: string | null = null;

    @Output()
    public readonly updateAlignStyles = new EventEmitter<string | null>();

    protected isAlignCenter(style?: string | null): boolean {
        return style?.replaceAll(/\s/g, '').includes('justify-content:center') ?? false;
    }

    protected isAlignJustify(style?: string | null): boolean {
        return style === null || style === undefined || style === '';
    }

    protected isAlignLeft(style?: string | null): boolean {
        return style?.replaceAll(/\s/g, '').includes('float:left') ?? false;
    }

    protected isAlignRight(style?: string | null): boolean {
        return style?.replaceAll(/\s/g, '').includes('float:right') ?? false;
    }

    protected alignLeft(): void {
        this.updateAlignStyles.emit('float: left');
    }

    protected alignCenter(): void {
        this.updateAlignStyles.emit(
            'display: flex; justify-content: center; margin-left: auto; margin-right: auto;',
        );
    }

    protected alignJustify(): void {
        this.updateAlignStyles.emit(null);
    }

    protected alignRight(): void {
        this.updateAlignStyles.emit('float: right');
    }
}
