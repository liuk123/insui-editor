import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  inject,
  Input,
  type OnDestroy,
  PLATFORM_ID,
  ViewContainerRef,
} from '@angular/core';
import {
  EMPTY_CLIENT_RECT,
  INS_SELECTION_STREAM,
  insAsDriver,
  insAsRectAccessor,
  InsBooleanHandler,
  InsDriver,
  insGetWordRange,
  InsRectAccessor,
  isElement,
  isTextNode,
  WINDOW,
} from '@liuk123/insui';
import { BehaviorSubject, combineLatest, debounceTime, map, throttleTime } from 'rxjs';
import { INS_EDITOR_PM_SELECTED_NODE } from '../../../common/pm-css-classes';

interface ServerSideGlobal extends Global {
  document: Document | undefined;
}

@Directive({
  standalone: true,
  selector: '[insToolbarDropdown]',
  providers: [insAsDriver(InsEditorDropdownToolbar), insAsRectAccessor(InsEditorDropdownToolbar)],
})
export class InsEditorDropdownToolbar extends InsDriver implements InsRectAccessor, OnDestroy {
  private previousTagPosition: DOMRect | null = null;
  private previousRect: DOMRect | null = null;
  protected range = isPlatformBrowser(inject(PLATFORM_ID)) ? new Range() : ({} as unknown as Range);

  private readonly doc: Document | null =
    inject<ServerSideGlobal | undefined>(WINDOW)?.document ?? null;

  private readonly selection$ = inject(INS_SELECTION_STREAM);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly vcr = inject(ViewContainerRef);

  private readonly handler$ = new BehaviorSubject<InsBooleanHandler<Range>>(() => false);

  private readonly stream$ = combineLatest([
    this.handler$,
    this.selection$.pipe(map(() => this.getRange())),
  ]).pipe(
    
    debounceTime(30),
    map(([handler, range]) => {
      const contained =
        this.el.nativeElement.contains(range.commonAncestorContainer) ||
        range.commonAncestorContainer.parentElement?.closest('ins-dropdown');
      this.range = 
        (contained && isTextNode(range.commonAncestorContainer)) ||
        ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(
          range.commonAncestorContainer.nodeName,
        )
          ? range
          : this.range;
      console.log(range.endContainer.nodeName)
      return contained && handler(this.range);
    }),
  );

  private readonly ghost?: HTMLElement;

  @Input('insToolbarDropdownPosition')
  public position: 'selection' | 'tag' | 'word' = 'selection';

  public readonly type = 'dropdown';

  constructor() {
    super((subscriber) => this.stream$.subscribe(subscriber));
  }

  @Input()
  public set insToolbarDropdown(visible: InsBooleanHandler<Range> | string) {
    if (typeof visible != 'string') {
      this.handler$.next(visible);
    }
  }

  public getClientRect(): DOMRect {
    switch (this.position) {
      case 'tag': {
        const { commonAncestorContainer } = this.range;
        const element = isElement(commonAncestorContainer)
          ? commonAncestorContainer
          : commonAncestorContainer.parentNode;

        if (element?.parentElement?.closest('ins-dropdown')) {
          return this.previousTagPosition ?? EMPTY_CLIENT_RECT;
        }

        this.previousTagPosition =
          element && isElement(element)
            ? this.doc?.querySelector(`.${INS_EDITOR_PM_SELECTED_NODE}`)?.getBoundingClientRect() ||
              element.getBoundingClientRect()
            : EMPTY_CLIENT_RECT;

        return this.previousTagPosition;
      }
      case 'word':
        return insGetWordRange(this.range).getBoundingClientRect();
      default: {
        const rect = this.range.getBoundingClientRect();

        if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
          if (this.previousRect) {
            return this.previousRect;
          }

          // const element = isElement(this.range.commonAncestorContainer)
          //   ? this.range.commonAncestorContainer
          //   : this.range.commonAncestorContainer.parentElement;

          // if (element) {
          //   return element.getBoundingClientRect();
          // }

          return (
            this.el.nativeElement.querySelector('p') ?? this.el.nativeElement
          ).getBoundingClientRect();
        }

        this.previousRect = rect;
        return rect;
      }
    }
  }

  public ngOnDestroy(): void {
    if (this.ghost) {
      this.vcr.element.nativeElement.removeChild(this.ghost);
    }
  }

  private getRange(): Range {
    const selection = this.doc?.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : this.range;

    return range.cloneRange();
  }
}
