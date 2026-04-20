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
  Input,
} from '@angular/core';
import { InsButton, InsDropdown } from '@liuk123/insui';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';
import { PositionSelectionService } from './position-selection.service';
import {
  fromEvent,
  map,
  race,
  switchMap,
  take,
  auditTime,
  startWith,
  BehaviorSubject,
  distinctUntilChanged,
  of,
} from 'rxjs';
import { NodeSelection } from '@tiptap/pm/state';
import { MultipleNodeSelection } from './MultipleNodeSelection';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INS_EDITOR_OPTIONS, InsEditorOptions } from '../../common/editor-options';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { AbstractInsEditor } from '../../common/editor-adapter';

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
  private editorInstance: AbstractInsEditor | null = inject(InsTiptapEditorService, {
    optional: true,
  });
  private readonly editor$ = new BehaviorSubject(this.editorInstance);
  protected readonly insertIcon = signal<string>('plus');
  private readonly options = inject(INS_EDITOR_OPTIONS);

  protected readonly positionSelectionSrv = inject(PositionSelectionService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('dragHandleBtn', { static: true, read: ElementRef })
  dragHandleBtn!: ElementRef<HTMLButtonElement>;

  @Input()
  public set editor(editor: AbstractInsEditor | null) {
    this.editorInstance = editor;
    this.editor$.next(editor);
  }
  public get editor(): AbstractInsEditor | null {
    return this.editorInstance;
  }

  get editorView() {
    return this.editor?.view;
  }

  protected insertOpen = signal(false);
  protected dragOpen = signal(false);
  public readonly dragHandleContent = input<TemplateRef<any> | null>(null);
  public readonly insertHandleContent = input<TemplateRef<any> | null>(null);

  ngOnInit(): void {
    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) => {
          return editor
            ? editor.transactionChange$.pipe(
                startWith(null),
                auditTime(30),
                takeUntilDestroyed(this.destroyRef),
              )
            : of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (!this.editorView) return;
        this.positionSelectionSrv.refreshActiveNode(this.editorView);
      });

    this.editor$
      .pipe(
        distinctUntilChanged(),
        switchMap((editor) => {
          return editor
            ? fromEvent<DragEvent>(this.dragHandleBtn.nativeElement, 'dragstart').pipe(
                switchMap((event) => {
                  this.positionSelectionSrv.onDragStart(event);
                  return race(
                    editor!.drop$.pipe(
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
            : of(null);
        }),
      ).subscribe((v) => {
        if (!v) return;
        this.restoreTextSelectionAfterDrag();
      });

    this.positionSelectionSrv.activeNode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ node }) => {
        this.insertIcon.set(this.resolveInsertIcon(node));
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

      this.editor?.setTextSelection(pos);
    });
  }

  private resolveInsertIcon(node: ProseMirrorNode | null): string {
    if (!node) {
      return 'plus';
    }

    const nodeName = node.type.name;
    const icons = this.options.icons as InsEditorOptions['icons'];

    if (nodeName === 'heading') {
      const level = Number(node.attrs['level']);
      if (level >= 1 && level <= 6) {
        return icons[`heading${level}` as keyof InsEditorOptions['icons']] as string;
      }
      return icons.header;
    }

    if (nodeName === 'paragraph') return icons.paragraph;
    if (nodeName === 'bulletList') return icons.listUnOrdered;
    if (nodeName === 'orderedList') return icons.listOrdered;
    if (nodeName === 'taskList' || nodeName === 'taskItem') return icons.taskList;
    if (nodeName === 'listItem') return icons.listPreview;
    if (nodeName === 'blockquote') return icons.quote;
    if (nodeName === 'codeBlock') return icons.codeBlock;
    if (nodeName === 'image' || nodeName === 'video' || nodeName === 'audio') return icons.image;
    if (nodeName === 'table') return icons.insertTable;

    return icons.groupAdd || 'plus';
  }
}
