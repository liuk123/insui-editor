import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  input,
  TemplateRef,
  ViewChild,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { InsButton, InsDropdown } from '@liuk123/insui';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { PositionSelectionService } from './position-selection.service';
import { fromEvent, filter, map, race, switchMap, take } from 'rxjs';
import { NodeSelection } from '@tiptap/pm/state';
import { MultipleNodeSelection } from './MultipleNodeSelection';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ins-drag-handle',
  imports: [InsButton, InsDropdown],
  templateUrl: './drag-handle.html',
  styleUrl: './drag-handle.less',
  host: {
    '[style.top.px]': 'positionSelectionSrv.top()',
    '[style.left.px]': 'positionSelectionSrv.left()',
    '[class.visible]': 'positionSelectionSrv.visible()',
  },
})
export class InsDragHandle implements OnInit, OnDestroy {
  private readonly editorService = inject(InsTiptapEditorService);

  protected readonly positionSelectionSrv = inject(PositionSelectionService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('dragHandleBtn', { static: true, read: ElementRef })
  dragHandleBtn!: ElementRef<HTMLButtonElement>;

  get editorView() {
    return this.editorService.getOriginTiptapEditor()?.view;
  }

  protected insertOpen = signal(false);
  protected dragOpen = signal(false);
  public readonly dragHandleContent = input<TemplateRef<any> | null>(null);
  public readonly insertHandleContent = input<TemplateRef<any> | null>(null);

  ngOnInit(): void {
    this.editorService.selectionChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.editorView) return;
      this.positionSelectionSrv.setActiveNode(this.editorView);
    });

    fromEvent<DragEvent>(this.dragHandleBtn.nativeElement, 'dragstart')
      .pipe(
        filter(() => !!this.editorView),
        switchMap((event) => {
          this.positionSelectionSrv.onDragStart(event);
          return race(
            this.editorService.drop$.pipe(
              take(1),
              map(() => 'drop' as const),
            ),
            fromEvent<DragEvent>(this.dragHandleBtn.nativeElement, 'dragend').pipe(
              take(1),
              map(() => 'dragend' as const),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.restoreTextSelectionAfterDrag();
      });
  }

  ngOnDestroy(): void {}

  private restoreTextSelectionAfterDrag() {
    requestAnimationFrame(() => {
      const { selection } = this.editorView?.state ?? {};
      if (!(selection instanceof NodeSelection || selection instanceof MultipleNodeSelection)) {
        return;
      }

      const node =
        selection instanceof NodeSelection
          ? selection.node
          : this.editorView?.state.doc.nodeAt(selection.from);
      const pos = selection.from + (node?.isTextblock ? 1 : 0);

      this.editorService.setTextSelection(pos);
    });
  }
}
