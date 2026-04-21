import {
  ChangeDetectorRef,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  Input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { auditTime, BehaviorSubject, distinctUntilChanged, of, shareReplay, startWith, switchMap } from 'rxjs';
import { AbstractInsEditor } from '../common/editor-adapter';
import { InsTiptapEditorService } from '../directives/tiptap-editor/tiptap-editor.service';
import { INS_EDITOR_OPTIONS, InsEditorOptions } from '../common/editor-options';
import { INS_EDITOR_TOOLBAR_TEXTS } from '../common/i18n';
import { InsIcons } from '@liuk123/insui';
import { InsLanguageEditor } from '../i18n/language';

@Directive()
export abstract class InsToolbarBase {
  private editorInstance: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  private readonly editor$ = new BehaviorSubject(this.editorInstance);


  protected readonly destroy$ = inject(DestroyRef);
  protected readonly options = inject(INS_EDITOR_OPTIONS);

  protected readonly texts = toSignal(inject(INS_EDITOR_TOOLBAR_TEXTS));


  protected iconDir = inject(InsIcons, { optional: true });

  protected editorChange$ = this.editor$.pipe(
    distinctUntilChanged(),
    switchMap((editor) => {
      return editor
        ? editor.transactionChange$.pipe(
            startWith(null),
            auditTime(100),
            shareReplay({ bufferSize: 1, refCount: true }),
            takeUntilDestroyed(this.destroy$),
          )
        : of(null);
    }),
    takeUntilDestroyed(this.destroy$),
  );
  constructor() {
    if (this.iconDir && this.getIcon) {
      effect(() =>this.iconDir!.iconStart = this.getIcon(this.options.icons));
    }
    if(this.getHint){
      effect(() => this.insHint.set(this.getHint?.(this.texts()) ?? ''));
    }
  }

  protected readonly insHint = signal('');
  protected readonly iconStart = signal('');


  protected abstract getIcon(icons: InsEditorOptions['icons']): string;
  protected abstract getHint(options?: InsLanguageEditor['toolbarTools']): string;

  @Input()
  public set editor(editor: AbstractInsEditor | null) {
    this.editorInstance = editor;
    this.editor$.next(editor);
  }

  public get editor(): AbstractInsEditor | null {
    return this.editorInstance;
  }
}
