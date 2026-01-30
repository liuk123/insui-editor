import {
    ChangeDetectionStrategy,
    Component,
    DOCUMENT,
    ElementRef,
    inject,
    Input,
    Renderer2,
    SecurityContext,
    signal,
    ViewEncapsulation,
} from '@angular/core';
import {type SafeHtml} from '@angular/platform-browser';
import { InsTiptapEditor } from '../../directives/tiptap-editor/tiptap-editor.directive';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { isElement, WINDOW } from '@liuk123/insui';
import { INS_EDITOR_SANITIZER } from '../../common/editor-sanitizer';

@Component({
    standalone: true,
    selector: 'ins-editor-socket',
    template: '',
    styleUrls: ['./editor-socket.component.less'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.ins-editor-socket]': 'options.enableDefaultStyles',
        '(click)': 'click($event)',
    },
})
export class InsEditorSocket {
    private readonly editor = inject(InsTiptapEditor, {optional: true});
    private readonly sanitizer = inject(INS_EDITOR_SANITIZER, {optional: true});
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly doc = inject(DOCUMENT);
    protected readonly options = inject(INS_EDITOR_OPTIONS);
    protected readonly html = signal<SafeHtml | string | null>(null);

    @Input()
    public set content(value: string | null | undefined) {
        const content = value ?? '';
        const safe = this.sanitizer?.sanitize(SecurityContext.HTML, content) ?? content;

        this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', safe);
    }

    /**
     * @description:
     * the main problem is that the external environment editor can use different base href="../"
     * More information: https://rogerkeays.com/blog/using-base-href-with-anchors
     */
    protected click(event: Event): void {
        if (this.editor || !isElement(event.target)) {
            return;
        }

        const href = event.target.closest('a')?.getAttribute('href') ?? '';

        if (!href.startsWith('#')) {
            return;
        }

        this.doc.location.hash = '';
        this.doc.location.hash = href.replace('#', '');
        event.preventDefault();
    }
}
