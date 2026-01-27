import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, OnDestroy, Output, signal, ViewChild, ViewEncapsulation, Input } from "@angular/core";
import { injectElement, INS_APPEARANCE_OPTIONS, InsAppearance, InsControl, InsValueTransformer, insGetWordRange, InsBooleanHandler, InsDropdown, InsDropdownOpen, InsDropdownDirective } from "@liuk123/insui";
import { INS_EDITOR_OPTIONS } from "../../common/editor-options";
import { InsEditorAttachedFile } from "../../common/attached";
import { TIPTAP_EDITOR } from "../../common/tiptap-editor";
import { delay } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { InsTiptapEditorService } from "../../directives/tiptap-editor/tiptap-editor.service";
import { INS_EDITOR_VALUE_TRANSFORMER } from "../../common/editor-value-transformer";
import { InsToolbarHost } from "../toolbar-host";
import { InsToolbar } from "../toolbar";
import { InsTiptapEditor } from "../../directives/tiptap-editor/tiptap-editor.directive";
import { AbstractInsEditor } from "../../common/editor-adapter";
import { provideInsEditor } from "../../providers/provide-ins-editor";
import { INS_EDITOR_PROVIDERS } from "./editor.providers";
import { InsEditorSocket } from "../editor-socket";


@Component({
  selector: 'ins-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  imports: [
    InsToolbarHost,
    InsToolbar,
    InsTiptapEditor,
    InsDropdown,
    InsEditorSocket,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InsDropdownDirective,
    {
      provide: INS_APPEARANCE_OPTIONS,
      useValue: { appearance: 'textfield' },
    },
    provideInsEditor({}),
    INS_EDITOR_PROVIDERS
  ],
  hostDirectives: [
    InsAppearance,
    {
      directive: InsDropdownOpen,
      inputs: ['insDropdownOpen'],
      outputs: ['insDropdownOpenChange']
    }
  ],
  host: {
    ngSkipHydration: 'true',
    '(insActiveZoneChange)': 'onActiveZone($event)',
    '(click)': 'focus($event)',
  }
})
export class InsEditor extends InsControl<string> implements OnDestroy {

  protected readonly options = inject(INS_EDITOR_OPTIONS);
  protected readonly editorLoaded = signal(false);
  protected readonly editorLoaded$ = inject(TIPTAP_EDITOR);
  public readonly editorService = inject(InsTiptapEditorService);
  private readonly contentProcessor = inject<
    InsValueTransformer<string | null, string | null>
  >(INS_EDITOR_VALUE_TRANSFORMER, { optional: true });

  protected readonly insDropdownOpen = inject(InsDropdownOpen, {optional: true});



  @ViewChild(InsTiptapEditor, { read: ElementRef })
  private readonly el?: ElementRef<HTMLElement>;
  public readonly rootEl = injectElement();

  public readonly focused = signal(false);

  @Input()
  public tools = this.options.tools;
  @Output()
  public readonly fileAttached = new EventEmitter<Array<InsEditorAttachedFile<any>>>();
  @Input()
  public floatingToolbar = this.options.floatingToolbar;
  @Output()
  public readonly focusIn = new EventEmitter<void>();
  @Output()
  public readonly focusOut = new EventEmitter<void>();

  protected readonly $ = this.editorLoaded$
    .pipe(delay(0), takeUntilDestroyed())
    .subscribe(() => {

      const processed =
        this.contentProcessor?.fromControlValue(this.control.value) ??
        this.control.value ??
        '';
      this.editorService.setValue(processed, { clearsHistory: true });
      this.editorLoaded.set(true);
    })

  ngOnDestroy(): void {

  }

public get editor(): AbstractInsEditor | null {
        return this.editorService.getOriginTiptapEditor() ? this.editorService : null;
    }
  public get nativeFocusableElement(): HTMLDivElement | null {
    return (
      this.el?.nativeElement.querySelector('[contenteditable].ProseMirror') || null
    );
  }
  protected focus(event: KeyboardEvent | MouseEvent): void {
    const isSafeArea =
      this.nativeFocusableElement?.contains(event.target as Node | null) ||
      Array.from(this.rootEl.querySelectorAll('ins-toolbar-host')).some((toolbar) =>
        toolbar.contains(event.target as Node | null),
      );

    if (isSafeArea) {
      return;
    }

    event.preventDefault();
    this.nativeFocusableElement?.focus();
  }
 

  protected get dropdownSelectionHandler(): InsBooleanHandler<Range> {
    if (!this.focused()||this.readOnly()) {
      return ()=>false;
    }
    return this.floatingToolbar?
      (range)=> (this.value().trim() !== '' && !this.editor?.state?.selection.empty)||
      this.openDropdownWhen(range)
      : this.openDropdownWhen
  }
  private readonly openDropdownWhen = (range: Range):boolean => 
    this.predicate(range) ||
    Boolean(this.insDropdownOpen?.insDropdownOpen);

  protected predicate: InsBooleanHandler<Range> = (value) => {
    console.log(String(insGetWordRange(value)).startsWith('@'))
    return String(insGetWordRange(value)).startsWith('@')
  }
  



  onModelChange(value: string | null): void {
    if (value === '' && !this.editorLoaded()) {
      return;
    }
    const processed = this.contentProcessor?.toControlValue(value) ?? value ?? '';
    if (processed !== this.control.value) {
      this.onChange(processed);
    }
  }
  protected onActiveZone(focused: boolean): void {
        this.focused.set(focused);

        if (focused) {
            this.focusIn.emit();
        } else {
            this.focusOut.emit();
        }
    }
}
