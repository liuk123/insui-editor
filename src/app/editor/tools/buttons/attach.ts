import {ChangeDetectionStrategy, Component, DestroyRef, ElementRef, EventEmitter, inject, Output, ViewChild} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '@liuk123/insui';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INS_ATTACH_FILES_LOADER, INS_ATTACH_FILES_OPTIONS } from '../../common/files-loader';
import { InsEditorAttachedFile } from '../../common/attached';

@Component({
    standalone: true,
    selector: 'button[insAttachTool]',
    template: `
        <input
            #fileUpload
            type="file"
            [accept]="attachOptions.accept"
            [multiple]="attachOptions.multiple"
            [tabIndex]="-1"
            (change)="onAttach(fileUpload)"
        />

        {{ insHint() }}
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool],
    host: {
        '(click)': 'fileUpload?.nativeElement?.click()',
    },
})
export class InsAttachButtonTool extends InsToolbarTool {
    private readonly destroyRef = inject(DestroyRef);
    private readonly filesLoader = inject(INS_ATTACH_FILES_LOADER, {optional: true});

    @ViewChild('fileUpload')
    protected fileUpload?: ElementRef<HTMLInputElement>;

    protected readonly attachOptions = inject(INS_ATTACH_FILES_OPTIONS);

    @Output()
    public readonly fileAttached = new EventEmitter<InsEditorAttachedFile[]>();

    protected getIcon(icons: InsEditorOptions['icons']): string {
        return icons.attach;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.attach ?? '';
    }

    protected onAttach(input: HTMLInputElement): void {
        const files = Array.from(input.files || []);

        input.value = '';

        if (files.length === 0) {
            return;
        }

        this.filesLoader?.(files)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((attachedFiles) => this.fileAttached.emit(attachedFiles));
    }
}
