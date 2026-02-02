import {Directive, ElementRef} from '@angular/core';
import { injectElement } from '@liuk123/insui';

@Directive({selector: '[insResizable]'})
export class InsResizable <T extends Element = HTMLElement> implements ElementRef<T>{
  public nativeElement = injectElement<T>();
}
