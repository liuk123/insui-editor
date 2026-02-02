
import {
    ChangeDetectionStrategy,
    Component,
    type ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { InsResizable, InsResizer } from '../../directives/resizer';

@Component({
    standalone: true,
    selector: 'ins-editor-resizable',
    imports: [InsResizable, InsResizer],
    templateUrl: './editor-resizable.component.html',
    styleUrls: ['./editor-resizable.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.width]': 'hostWidth',
        '[style.height]': 'hostHeight',
    },
})
export class InsEditorResizable {
    @ViewChild('container', {static: true})
    public container?: ElementRef<HTMLDivElement>;

    @Input()
    public isEditable = false;

    @Input()
    public autoHeight = false;

    @Input()
    public width: number | string | null = null;

    @Input()
    public height: number | string | null = null;

    @Output()
    public readonly sizeChange = new EventEmitter<
        readonly [width: number, height: number]
    >();

    protected get hostWidth(): number | string | null {
        return typeof this.width === 'number' ? this.width + 'px' : this.width;
    }

    protected get hostHeight(): number | string | null {
        if (this.autoHeight) {
            return null;
        }

        return typeof this.height === 'number' ? this.height + 'px' : this.height;
    }
}
