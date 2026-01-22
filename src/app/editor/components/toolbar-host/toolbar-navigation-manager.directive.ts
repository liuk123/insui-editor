import {Directive, ElementRef, inject} from '@angular/core';
import { getClosestFocusable, insClamp, isNativeFocusedIn, isNativeMouseFocusable } from '@liuk123/insui';

@Directive({
    standalone: true,
    selector: '[insToolbarNavigationManager]',
    host: {
        '(keydown.arrowRight.prevent)': 'onHorizontalNavigation(false)',
        '(keydown.arrowLeft.prevent)': 'onHorizontalNavigation(true)',
    },
})
export class InsToolbarNavigationManager {
    private readonly el: HTMLElement = inject(ElementRef).nativeElement;

    public findFirstFocusableTool(reversed = false): HTMLElement | null {
        const tools = reversed
            ? this.toolsContainers.slice().reverse()
            : this.toolsContainers;

        for (const el of tools) {
            const focusableElement = isNativeMouseFocusable(el) 
                ? el
                : getClosestFocusable({initial: el, root: el, keyboard: false});

            if (focusableElement) {
                return focusableElement;
            }
        }

        return null;
    }

    protected onHorizontalNavigation(toPrevious: boolean): void {
        const {toolsContainers} = this;
        const focusedToolIndex = toolsContainers.findIndex(isNativeFocusedIn);

        const targetToolIndex = insClamp(
            focusedToolIndex + (toPrevious ? -1 : 1),
            0,
            toolsContainers.length - 1,
        );
        const targetToolWrapper = toolsContainers[targetToolIndex];
        const targetTool = toPrevious
            ? this.findPreviousTool(targetToolWrapper)
            : this.findNextTool(targetToolWrapper);

        if (targetTool) {
            targetTool.focus();
        }
    }

    private get toolsContainers(): readonly HTMLElement[] {
        return Array.from(this.el.querySelectorAll<HTMLElement>('[insItem]'));
    }

    private findPreviousTool(wrapper?: HTMLElement | null): HTMLElement | null {
        if (!wrapper || isNativeMouseFocusable(wrapper)) {
            return wrapper ?? null;
        }

        const lookedInside = getClosestFocusable({
            initial: wrapper,
            root: wrapper,
            keyboard: false,
        });

        return (
            lookedInside ||
            getClosestFocusable({
                initial: wrapper,
                root: this.el,
                previous: true,
                keyboard: false,
            })
        );
    }

    private findNextTool(wrapper?: HTMLElement | null): HTMLElement | null {
        return !wrapper || isNativeMouseFocusable(wrapper)
            ? (wrapper ?? null)
            : getClosestFocusable({
                  initial: wrapper,
                  root: this.el,
                  keyboard: false,
              });
    }
}
