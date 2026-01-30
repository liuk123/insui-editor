import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  signal,
  ViewChild,
  ViewEncapsulation,
  Input,
  effect,
  computed,
} from '@angular/core';
import {
  injectElement,
  INS_APPEARANCE_OPTIONS,
  InsAppearance,
  InsControl,
  InsValueTransformer,
  InsBooleanHandler,
  InsDropdown,
  InsDropdownOpen,
  InsDropdownDirective,
  InsPopup,
  WINDOW,
} from '@liuk123/insui';
import { INS_EDITOR_OPTIONS } from '../../common/editor-options';
import { InsEditorAttachedFile } from '../../common/attached';
import { TIPTAP_EDITOR } from '../../common/tiptap-editor';
import { delay, fromEvent, map, merge } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { INS_EDITOR_VALUE_TRANSFORMER } from '../../common/editor-value-transformer';
import { InsToolbarHost } from '../toolbar-host';
import { InsToolbar } from '../toolbar';
import { InsTiptapEditor } from '../../directives/tiptap-editor/tiptap-editor.directive';
import { AbstractInsEditor } from '../../common/editor-adapter';
import { INS_EDITOR_PROVIDERS } from './editor.providers';
import { InsEditorSocket } from '../editor-socket';
import { InsEditorDropdownToolbar } from './dropdown/dropdown-toolbar.directive';
import {
  insGetSelectionState,
  InsSelectionState,
} from '../../directives/tiptap-editor/utils/get-selection-state';
import { insIsSafeLinkRange } from '../../directives/tiptap-editor/utils/safe-link-range';

interface ServerSideGlobal extends Global {
    document: Document | undefined;
}

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
    InsEditorDropdownToolbar,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InsDropdownDirective,
    {
      provide: INS_APPEARANCE_OPTIONS,
      useValue: { appearance: 'textfield' },
    },
    INS_EDITOR_PROVIDERS,
  ],
  hostDirectives: [
    InsAppearance,
    {
      directive: InsDropdownOpen,
      inputs: ['insDropdownOpen'],
      outputs: ['insDropdownOpenChange'],
    },
  ],
  host: {
    ngSkipHydration: 'true',
    '(insActiveZoneChange)': 'onActiveZone($event)',
    '(click)': 'focus($event)',
  },
})
export class InsEditor extends InsControl<string> implements OnDestroy {
  protected readonly options = inject(INS_EDITOR_OPTIONS);
  protected readonly editorLoaded = signal(false);
  protected readonly editorLoaded$ = inject(TIPTAP_EDITOR);
  public readonly editorService = inject(InsTiptapEditorService);
  private readonly contentProcessor = inject<InsValueTransformer<string | null, string | null>>(
    INS_EDITOR_VALUE_TRANSFORMER,
    { optional: true },
  );

  protected readonly insDropdownOpen = inject(InsDropdownOpen, { optional: true });
  private readonly doc: Document | null =
        inject<ServerSideGlobal | undefined>(WINDOW)?.document ?? null;
  private el = injectElement();

  @ViewChild(InsTiptapEditor, { read: ElementRef })
  private readonly editorEl?: ElementRef<HTMLElement>;
  public readonly rootEl = injectElement();

  public readonly focused = signal(false);
  private readonly appearance = inject(InsAppearance);

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


  private hasMentionPlugin = false;
  protected readonly $ = this.editorLoaded$.pipe(delay(0), takeUntilDestroyed()).subscribe(() => {
    this.hasMentionPlugin = !!this.editorService
      .getOriginTiptapEditor()
      ?.extensionManager.extensions.find((extension) => extension.name === 'mention');

    const processed =
      this.contentProcessor?.fromControlValue(this.control.value) ?? this.control.value ?? '';
    this.editorService.setValue(processed, { clearsHistory: true });
    this.editorLoaded.set(true);

    this.patchContentEditableElement();
  });

  public readonly hovered = toSignal(
    merge(
      fromEvent(this.el, 'mouseenter').pipe(map(() => true)),
      fromEvent(this.el, 'mouseleave').pipe(map(() => false)),
    ),
  );

  constructor() {
    super();
    effect(() => {
      this.appearance.insAppearanceState.set(this.state());
    });
    effect(() => {
      this.appearance.insAppearanceMode.set(this.mode());
    });
    effect(()=>{
      this.appearance.insAppearanceFocus.set(this.focused());
    })
  }
  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  private readonly state = computed(() => {
    if (this.disabled()) {
      return 'disabled';
    }
    return this.hovered() ? 'hover' : null;
  });
  public get editor(): AbstractInsEditor | null {
    return this.editorService.getOriginTiptapEditor() ? this.editorService : null;
  }
  public get nativeFocusableElement(): HTMLDivElement | null {
    return this.editorEl?.nativeElement.querySelector('[contenteditable].ProseMirror') || null;
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
    if (!this.focused() || this.readOnly()) {
      return () => false;
    }
    return this.floatingToolbar
      ? (range) =>
          (this.value().trim() !== '' &&
            this.editor?.state?.selection.empty === false 
            // && !range.collapsed
          ) ||
          this.openDropdownWhen(range)
      : this.openDropdownWhen;
  }
  private readonly openDropdownWhen = (range: Range): boolean =>
    this.currentFocusedNodeIsTextAnchor(range) ||
    this.isMentionMode ||
    Boolean(this.insDropdownOpen?.insDropdownOpen);

  private get focusNode(): Node | null {
    return this.doc?.getSelection()?.focusNode ?? null;
  }
  /**
   * @description:
   * The commonAncestorContainer not always relevant node element in Range,
   * so the focusNode is used for the correct behaviour from the selection,
   * which is the actual element at the moment
   */
  private currentFocusedNodeIsTextAnchor(range: Range): boolean {
    return (
      this.focusNode?.nodeName === 'A' ||
      !!this.focusNode?.parentElement?.closest('a') ||
      !!this.focusNode?.parentElement?.closest('[insEditorRootEditLink]') ||
      (!!range.startContainer.parentElement?.closest('a') && insIsSafeLinkRange(range))
    );
  }

  public get isMentionMode(): boolean {
    // console.log('isMentionMode', this.hasMentionPlugin, this.selectionState.before.startsWith('@'))
    return this.hasMentionPlugin && this.selectionState.before.startsWith('@');
  }

  public get selectionState(): InsSelectionState {
    return insGetSelectionState(this.editor);
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

  public override writeValue(value: string | null): void {
    const processed = this.contentProcessor?.fromControlValue(value) ?? value ?? '';

    super.writeValue(processed);

    if (this.editorLoaded()) {
      this.editorService.setValue(processed);
    }
  }
  private patchContentEditableElement(): void {
        this.nativeFocusableElement?.setAttribute('translate', this.options.translate);
        this.nativeFocusableElement?.setAttribute(
            'spellcheck',
            String(this.options.spellcheck),
        );
    }
}
