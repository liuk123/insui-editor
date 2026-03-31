import {
  ChangeDetectorRef,
  computed,
  Directive,
  effect,
  inject,
  type OnInit,
  signal,
} from '@angular/core';
import { InsAppearance } from '@liuk123/insui';
import { InsToolbarButtonTool } from './tool-button';
import { InsToolbarBase } from './tool-base';

@Directive()
export abstract class InsToolbarTool extends InsToolbarBase implements OnInit {
  protected readonly cd = inject(ChangeDetectorRef);

  protected readonly readOnly = signal(false);
  protected readonly activeOnly = signal(false);
  protected readonly isFocused = signal(false);

  private appearance = inject(InsAppearance);
  private insToolbarButtonTool = inject(InsToolbarButtonTool, { optional: true });

  constructor() {
    super();
    effect(() => this.appearance.insAppearanceState.set(this.active()));
    effect(() => this.insToolbarButtonTool?.disabled.set(this.readOnly()));

  }

  protected readonly active = computed(() =>
    this.activeOnly() && this.isFocused() ? 'active' : null,
  );

  protected getDisableState?(): boolean;
  protected isActive?(): boolean;



  public ngOnInit(): void {
    this.editorChange$.subscribe(() => this.updateSignals());
  }

  protected updateSignals(): void {
    this.isFocused.set(this.editor?.isFocused ?? false);
    this.readOnly.set(this.getDisableState?.() ?? false);
    this.activeOnly.set(this.isActive?.() ?? false);

    // caretaker note: trigger computed effect
    // this.cd.detectChanges();
  }
}
