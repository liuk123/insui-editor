import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { InsButton } from '@liuk123/insui';

@Component({
  selector: 'ins-palette',
  imports: [InsButton],
  templateUrl: './palette.html',
  styleUrl: './palette.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class InsPalette {
  @Input()
  public colors: ReadonlyMap<string, string> = new Map();
  @Output()
  public colorChange = new EventEmitter<string>();
}
