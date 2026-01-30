import {AsyncPipe} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    type QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';

import {InsToolbarNavigationManager} from './toolbar-navigation-manager.directive';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { EMPTY_QUERY, isNativeFocusedIn } from '@liuk123/insui';
import { AbstractInsEditor } from '../../common/editor-adapter';

@Component({
    standalone: true,
    selector: 'ins-toolbar-host',
    imports: [AsyncPipe, InsToolbarNavigationManager],
    templateUrl: './toolbar-host.component.html',
    styleUrls: ['./toolbar-host.style.less'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // insHintOptionsProvider({
        //     direction: ['top-left', 'top', 'right'],
        // }),
    ],
    host: {
        role: 'toolbar',
        insToolbarHost: '',
        '[class._disabled]': 'disabled',
        '(mousedown)': 'onMouseDown($event, $event.target)',
    },
})
export class InsToolbarHost {
    @ViewChild(InsToolbarNavigationManager)
    private readonly navigationManager?: InsToolbarNavigationManager;

    @ViewChildren('dropdown', {read: ElementRef})
    private readonly dropdowns: QueryList<ElementRef<HTMLElement>> = EMPTY_QUERY;

    protected readonly injectionEditor = inject(InsTiptapEditorService, {optional: true});

    @Input('editor')
    public inputEditor: AbstractInsEditor | null = null;

    @Input()
    public disabled = false;

    public readonly el: HTMLElement | null =
        inject(ElementRef, {optional: true})?.nativeElement ?? null;

    protected get editor(): AbstractInsEditor | null {
        return this.injectionEditor ?? this.inputEditor;
    }

    protected get focused(): boolean {
        return (
            isNativeFocusedIn(this.el) ||
            !!this.dropdowns.find(({nativeElement}) => isNativeFocusedIn(nativeElement))
        );
    }

    protected get focusable(): boolean {
        return !this.focused && !this.disabled;
    }

    protected onTopFocus(): void {
        this.focusFirst();
    }

    protected onBottomFocus(): void {
        this.focusLast();
    }

    protected onMouseDown(event: MouseEvent, target: HTMLElement): void {
        if (target.closest('button')) {
            return;
        }

        event.preventDefault();
        this.editor?.focus();
    }

    private focusFirst(): void {
        this.navigationManager?.findFirstFocusableTool()?.focus();
    }

    private focusLast(): void {
        this.navigationManager?.findFirstFocusableTool(true)?.focus();
    }
}