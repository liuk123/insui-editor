import {Directive, ElementRef, inject, Input, Output, Renderer2} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, map} from 'rxjs';
import { InsTiptapEditorService } from './tiptap-editor.service';
import { INITIALIZATION_TIPTAP_CONTAINER, TIPTAP_EDITOR } from '../../common/tiptap-editor';

@Directive({
    standalone: true,
    selector: '[insTiptapEditor]',
})
export class InsTiptapEditor {
    private canEdit = true;
    private readonly el = inject(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly editor = inject(InsTiptapEditorService);
    protected editorContainer = inject(INITIALIZATION_TIPTAP_CONTAINER);

    protected readonly $ = inject(TIPTAP_EDITOR)
        .pipe(takeUntilDestroyed())
        .subscribe(() => {
            this.renderer.appendChild(this.el.nativeElement, this.editorContainer);
            this.editable = this.canEdit; // synchronized editable state after first render
        });

    @Output()
    public readonly valueChange = this.editor.valueChange$.pipe(
      map(()=>{
        return this.outputFormat === 'html' ? this.editor.html : this.editor.json;
      }),
      distinctUntilChanged()
    );

    @Input()
    public set value(value: string) {
        this.editor.setValue(value);
    }

    @Input()
    public set editable(editable: boolean) {
        this.canEdit = editable;
        this.editor.editable = editable;
    }
    @Input()
    public outputFormat: 'html' | 'json' = 'html';
}
