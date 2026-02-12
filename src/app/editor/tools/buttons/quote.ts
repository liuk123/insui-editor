import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsEditorOptions } from '../../common/editor-options';
import { injectElement, InsLanguageEditor } from '@liuk123/insui';
import { fromEvent} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'button[insBlockquoteTool]',
  template: '{{ insHint() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool],
  host: {
    '[attr.automation-id]': '"toolbar__quote-button"',
  },
})
export class InsBlockquoteButtonTool extends InsToolbarTool implements AfterViewInit {
  public readonly el = injectElement();
  private readonly destroyRef = inject(DestroyRef);
  ngAfterViewInit(): void {
    fromEvent(this.el, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toggleBlockquote());
  }

  protected override isActive(): boolean {
    return this.editor?.isActive('blockquote') ?? false;
  }

  protected override getDisableState(): boolean {
    return this.editor?.isActive('blockquote') ?? false;
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.quote;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.quote ?? '';
  }
  toggleBlockquote() {
    this.editor?.toggleBlockquote();
  }
}
