import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
} from '@angular/core';
import {DomSanitizer, type SafeResourceUrl} from '@angular/platform-browser';
import { AbstractInsEditorResizable, InsEditorResizable } from '../../components/editor-resizable';
import { InsEditableIframe } from '../../common/iframe';
import { INS_IFRAME_EDITOR_OPTIONS } from './iframe-editor.options';
import { INS_EDITOR_RESIZE_EVENT } from '../../common/default-events';

@Component({
    standalone: true,
    selector: 'ins-iframe-editor',
    imports: [InsEditorResizable],
    templateUrl: './iframe-editor.component.html',
    styleUrls: ['./iframe-editor.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsIframeEditor extends AbstractInsEditorResizable<InsEditableIframe> {
    private readonly sanitizer = inject(DomSanitizer);
    private readonly el: ElementRef<HTMLDivElement> = inject(ElementRef);
    protected readonly options = inject(INS_IFRAME_EDITOR_OPTIONS);
    protected readonly changeDetector = inject(ChangeDetectorRef);

    public updateSize([width, height]: readonly [width: number, height: number]): void {
        this.currentWidth = Math.max(
            this.options.minWidth,
            Math.min(this.options.maxWidth, width),
        );

        this.currentHeight = Math.max(
            this.options.minHeight,
            Math.min(this.options.maxHeight, height),
        );

        this.attrs.width = this.currentWidth;
        this.attrs.height = this.currentHeight;

        this.el.nativeElement.dispatchEvent(
            new CustomEvent(INS_EDITOR_RESIZE_EVENT, {bubbles: true}),
        );
    }

    protected get src(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.attrs.src ?? '');
    }
}
