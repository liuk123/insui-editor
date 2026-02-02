import {Directive, type ElementRef, inject, input, output} from '@angular/core';

import {InsResizable} from './resizable.directive';

@Directive({
    selector: '[insResizer]',
    host: {
        '[style.cursor]': 'cursor',
        '[style.touchAction]': '"none"',
        '(pointerdown.zoneless.prevent)': 'onPointerDown($event.x, $event.y)',
        '(document:pointermove.zoneless)': 'onPointerMove($event)',
        '(document:pointerup.zoneless)': 'onPointerUp()',
    },
})
export class InsResizer {
    private readonly resizable: ElementRef<HTMLElement> = inject(InsResizable);

    protected x = NaN;
    protected y = NaN;
    protected width = 0;
    protected height = 0;

    public readonly insResizer = input<readonly [x: number, y: number]>([0, 0]);

    public readonly insSizeChange = output<readonly [x: number, y: number]>();

    protected get cursor(): string {
        const insResizer = this.insResizer();

        if (!insResizer[0]) {
            return 'ns-resize';
        }

        if (!insResizer[1]) {
            return 'ew-resize';
        }

        if (insResizer[0] * insResizer[1] > 0) {
            return 'nwse-resize';
        }

        return 'nesw-resize';
    }

    protected onPointerDown(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.width = this.resizable.nativeElement.clientWidth;
        this.height = this.resizable.nativeElement.clientHeight;
    }

    protected onPointerMove({x, y, buttons}: PointerEvent): void {
        if (!buttons) {
            this.onPointerUp();
        } else {
            this.onMove(x, y);
        }
    }

    protected onPointerUp(): void {
        this.x = NaN;
    }

    protected onMove(x: number, y: number): void {
        const insResizer = this.insResizer();

        if (Number.isNaN(this.x)) {
            return;
        }

        const {style} = this.resizable.nativeElement;
        const size = [
            this.width + insResizer[0] * (x - this.x),
            this.height + insResizer[1] * (y - this.y),
        ] as const;

        if (insResizer[0]) {
            style.width = size[0] + 'px';
        }

        if (insResizer[1]) {
            style.height = size[1] + 'px';
        }

        this.insSizeChange.emit(size);
    }
}
