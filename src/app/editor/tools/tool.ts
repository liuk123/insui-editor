import {
  ChangeDetectorRef,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  Input,
  type OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, distinctUntilChanged, of, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { AbstractInsEditor } from '../common/editor-adapter';
import { InsTiptapEditorService } from '../directives/tiptap-editor/tiptap-editor.service';
import { INS_EDITOR_OPTIONS, InsEditorOptions } from '../common/editor-options';
import { INS_EDITOR_TOOLBAR_TEXTS } from '../common/i18n';
import { InsAppearance, InsIcons, InsLanguageEditor } from '@liuk123/insui';
import { InsToolbarButtonTool } from './tool-button';

@Directive()
export abstract class InsToolbarTool implements OnInit {
  private editorInstance: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });

  private readonly editor$ = new BehaviorSubject(this.editorInstance);

  protected readonly cd = inject(ChangeDetectorRef);
  protected readonly destroy$ = inject(DestroyRef);
  // protected readonly isMobile = inject(IS_MOBILE);
  protected readonly options = inject(INS_EDITOR_OPTIONS);

  protected readonly texts = toSignal(inject(INS_EDITOR_TOOLBAR_TEXTS));
  protected readonly readOnly = signal(false);
  protected readonly activeOnly = signal(false);
  protected readonly isFocused = signal(false);

  private iconDir = inject(InsIcons, { optional: true });
  private appearance = inject(InsAppearance);
  private insToolbarButtonTool = inject(InsToolbarButtonTool, { optional: true });
  constructor() {
    if (this.iconDir) {
      this.iconDir.iconStart = this.getIcon(this.options.icons);
    }
    effect(() => {
      this.appearance.insAppearanceState.set(this.active());
    });
    effect(() => {
      if (this.insToolbarButtonTool) {
        this.insToolbarButtonTool.disabled.set(this.readOnly());
      }
    });
  }

  protected readonly insHint = computed(() => this.getHint(this.texts()));
  protected readonly iconStart = computed(() => this.getIcon(this.options.icons));
  protected readonly active = computed(() =>
    this.activeOnly() && this.isFocused() ? 'active' : null,
  );

  protected getDisableState?(): boolean;

  protected isActive?(): boolean;

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

  public ngOnInit(): void {
    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) => {
          this.updateSignals();

          return editor
            ? editor.selectionChange$.pipe(
                startWith(null),
                shareReplay({ bufferSize: 1, refCount: true }),
                takeUntilDestroyed(this.destroy$),
                // tap(()=>this.cd.markForCheck())
              )
            : of(null);
        }),
        takeUntilDestroyed(this.destroy$),
      )
      .subscribe(() => this.updateSignals());
  }

  protected updateSignals(): void {
    this.isFocused.set(this.editor?.isFocused ?? false);
    this.readOnly.set(this.getDisableState?.() ?? false);
    this.activeOnly.set(this.isActive?.() ?? false);

    // caretaker note: trigger computed effect
    // this.cd.detectChanges();
  }
}
