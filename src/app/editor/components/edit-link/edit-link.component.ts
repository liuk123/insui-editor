import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { InsButton, InsTextfield, WINDOW } from '@liuk123/insui';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { AbstractInsEditor } from '../../common/editor-adapter';

interface ServerSideGlobal extends Global {
  document: Document | undefined;
}

@Component({
  selector: 'ins-edit-link',
  templateUrl: './edit-link.component.html',
  styleUrls: ['./edit-link.component.less'],
  imports: [InsButton, InsTextfield],
  host: {
    '(document:selectionchange)': 'onSelectionChange()',
  },
})
export class InsEditLink implements OnInit {
  private readonly injectionEditor = inject(InsTiptapEditorService, { optional: true });
  private readonly doc: Document | null =
    inject<ServerSideGlobal | undefined>(WINDOW)?.document ?? null;

  protected readonly options = inject(INS_EDITOR_OPTIONS);
  protected url = this.getHrefOrAnchorId();
  protected prefix = 'http://';

  protected edit = true;

  @Output()
  public readonly addLink = new EventEmitter<string>();
  @Output()
  public readonly removeLink = new EventEmitter<void>();
  @Input('editor')
  public inputEditor: AbstractInsEditor | null = null;
  @Input('anchorMode')
  public anchorMode = this.detectAnchorMode();

  protected get href(): string {
    return this.url;
  }
  protected get editor(): AbstractInsEditor | null {
    return this.injectionEditor ?? this.inputEditor;
  }

  ngOnInit() {}

  protected onClear(): void {
    this.url = '';
  }
  protected onSave(): void {
    if (this.url) {
      this.addLink.emit(this.href);
    } else {
      this.removeLink.emit();
    }
  }
  protected onBlur(url: string): void {
    const range = this.editor?.getSelectionSnapshot();
    if (range && !url && !this.url) {
      this.editor?.setTextSelection({ from: range.anchor, to: range.head });

      if (this.anchorMode) {
        this.editor?.removeAnchor();
      } else {
        this.editor?.toggleLink('');
      }
    }
  }
  protected onSelectionChange() {
    if(!this.edit){
      this.url = this.getHrefOrAnchorId();
      this.anchorMode = this.detectAnchorMode();
    }
  }

  private getFocusedParentElement(): HTMLElement | null {
    return this.doc?.getSelection()?.focusNode?.parentElement || null;
  }

  private getAnchorElement(): HTMLAnchorElement | null {
    const focusable = this.getFocusedParentElement();

    return focusable?.closest('a') ?? focusable?.querySelector('img')?.closest('a') ?? null;
  }
  private getHrefOrAnchorId(): string {
    const a = this.getAnchorElement();
    return a ? (a.getAttribute('href') ?? a.getAttribute('id') ?? '') : this.url;
  }

  private detectAnchorMode(): boolean {
    const a = this.getAnchorElement();

    return !a?.href && (!!a?.getAttribute('id') || a?.getAttribute('data-type') === 'jump-anchor');
  }
  // protected onMouseDown(event: MouseEvent): void {
  //   if (isElement(event.target) && !event.target.matches('a, button, input')) {
  //     event.preventDefault();
  //   }
  // }
}
