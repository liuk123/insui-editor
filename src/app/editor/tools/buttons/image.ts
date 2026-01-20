import {ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    selector: 'button[insImageTool]',
    imports: [],
    template: `
        <input
            #image
            accept="image/*"
            type="file"
            (change)="onImage(image)"
        />

        {{ insHint() }}
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'image?.nativeElement?.click()',
    },
})
export class InsImageButtonTool extends InsToolbarTool {
    private readonly destroyRef = inject(DestroyRef);
    private readonly imageLoader = inject(INS_IMAGE_LOADER);

    @ViewChild('image')
    protected image?: ElementRef<HTMLInputElement>;

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.image;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.image ?? '';
    }

    protected onImage(input: HTMLInputElement): void {
        const file = input.files?.[0];

        input.value = '';

        if (!file) {
            return;
        }

        this.imageLoader(file)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((image) => this.editor?.setImage(image));
    }
}
