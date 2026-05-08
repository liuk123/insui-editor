import {Directive} from '@angular/core';
import {type Editor, type JSONContent, type Range} from '@tiptap/core';
import {type MarkType} from '@tiptap/pm/model';
import { NodeSelection, type EditorState } from '@tiptap/pm/state';
import {debounceTime, distinctUntilChanged, filter, isEmpty, map, type Observable, share, Subject} from 'rxjs';
import { EditorView } from '@tiptap/pm/view';
import { InsEditorAttachedFile } from './attached';

export class ActiveNodePath {
    constructor(
      public node: string,
      public nodePos: number,
      public attrs?: Attrs,
      public isEmpty?: boolean,
    ) { }
}

export interface InsSelectionSnapshot {
    anchor: number;
    head: number;
}

export interface InsSetValueOption {
    clearsHistory?: boolean;
}

type Attrs = Record<string, unknown>;

@Directive()
export abstract class AbstractInsEditor {
    public abstract readonly isFocused: boolean;
    public abstract readonly html: string;
    public abstract readonly json: string;
    public abstract editable: boolean;

    // 事务状态
    public transactionStable = false


    public readonly transaction$ = new Subject<void>();
    public readonly transactionPathChange$:Observable<ActiveNodePath[]> = this.transaction$.pipe(
      filter(() => !this.transactionStable),
      debounceTime(100),
      map(()=>{
        if(!this.state){
          return []
        }
        const selection = this.state.selection;
        const $pos = selection.$from;
        const path = [];

        if (selection instanceof NodeSelection && selection.node.isBlock) {
          path.push(
            new ActiveNodePath(
              selection.node.type.name,
              selection.from,
              selection.node.attrs,
              false,
            ),
          );
        }

        for (let d = $pos.depth; d > 0; d--) {
          let parent = $pos.node(d)
          if(parent.isBlock){
            path.push(
              new ActiveNodePath(
                parent.type.name,
                $pos.before(d),
                parent.attrs,
                d === $pos.depth &&parent.content.size === 0
              )
            )
          }
        }
        return path
      }),
      distinctUntilChanged((a: ActiveNodePath[], b: ActiveNodePath[]) => {
        if(a.length !== b.length){
          return false
        }
        return !a.some((item, index) => item.node !== b[index]?.node || item.attrs?.['level'] !== b[index]?.attrs?.['level'] || item.nodePos !== b[index]?.nodePos)
      }),
      share()
    )
    // public readonly selectionChange$ = new Subject<void>();
    public readonly drop$ = new Subject<DragEvent>();

    public abstract get state(): EditorState | null;
    public abstract get view(): EditorView | null;

    public abstract isActive$(attributes: Attrs): Observable<boolean>;
    public abstract isActive$(name: string, attributes?: Attrs): Observable<boolean>;

    public abstract isActive(attributes: Attrs): boolean;
    public abstract isActive(name: string, attributes?: Attrs): boolean;

    public abstract undoDisabled(): boolean;

    public abstract redoDisabled(): boolean;

    public abstract getFontColor(): string;

    public abstract getFontSize(): number;

    public abstract setFontSize(size: number): void;

    public abstract getBackgroundColor(): string;

    public abstract getCellColor(): string;

    public abstract getGroupColor(): string;

    public abstract onAlign(align: string): void;

    public abstract setImage(src: string): void;

    public abstract undo(): void;

    public abstract redo(): void;

    public abstract setHorizontalRule(): void;

    public abstract removeFormat(): void;

    public abstract removeBlocks(): void;

    // public abstract setFontColor(color: string): void;

    public abstract setHighlightColor(color: string): void;
    public abstract unsetHighlight(): void;
    public abstract toggleHighlight(): void;

    public abstract setFontColor(color: string): void;
    public abstract unsetFontColor(): void;

    public abstract setBackgroundColor(color: string): void;
    public abstract unsetBackgroundColor(): void;


    public abstract toggleBold(): void;

    public abstract toggleItalic(): void;

    public abstract toggleUnderline(): void;

    public abstract toggleBlockquote(): void;

    public abstract toggleStrike(): void;

    public abstract toggleOrderedList(): void;

    public abstract toggleUnorderedList(): void;

    public abstract toggleCode(): void;

    public abstract togglePre(): void;

    public abstract clearHistory(): void;

    public abstract toggleSubscript(): void;

    public abstract toggleSuperscript(): void;

    public abstract toggleCodeBlock(): void;

    public abstract toggleTaskList(): void;

    public abstract liftListItem(): void;

    public abstract sinkListItem(): void;

    public abstract insertTable(rows: number, cols: number): void;

    public abstract addColumnAfter(): void;

    public abstract addColumnBefore(): void;

    public abstract addRowAfter(): void;

    public abstract addRowBefore(): void;

    public abstract deleteColumn(): void;

    public abstract deleteRow(): void;
    public abstract clearRow(): void;

    public abstract mergeCells(): void;

    public abstract canMergeCells(): boolean;

    public abstract canSplitCells(): boolean;

    public abstract splitCell(): void;

    public abstract setHeading(level: number): void;

    public abstract removeEmptyTextStyle(): void;

    public abstract toggleMark(
        typeOrName: MarkType | string,
        attributes?: Record<string, any>,
        options?: {
            /**
             * Removes the mark even across the current selection. Defaults to `false`.
             */
            extendEmptyMarkRange?: boolean;
        },
    ): void;

    public abstract setParagraph(options?: {fontSize: string}): void;

    public abstract setHardBreak(): void;

    public abstract setTextSelection(value: Range | number): void;

    public abstract toggleLink(href: string): void;

    public abstract setLink(href: string): void;

    public abstract unsetLink(): void;

    public abstract destroy(): void;

    public abstract selectClosest(): void;

    public abstract focus(): void;

    public abstract takeSelectionSnapshot(): void;

    public abstract getSelectionSnapshot(): InsSelectionSnapshot | null;

    public abstract setValue(value: string, options?: InsSetValueOption): void;

    public abstract setJsonValue(value: JSONContent, options?: InsSetValueOption): void;

    public abstract setCellColor(color: string): void;
    public abstract setCellAlign(align: 'left' | 'center' | 'right'): void;
    public abstract setCellVerticalAlign(align: 'top' | 'middle' | 'bottom'): void;

    public abstract getOriginTiptapEditor(): Editor | null;

    public abstract enter(): void;

    public abstract setDetails(): void;

    public abstract unsetDetails(): void;

    public abstract setGroup(): void;

    public abstract setGroupHilite(color: string): void;

    public abstract removeGroup(): void;

    public abstract setAnchor(id: string): void;

    public abstract removeAnchor(): void;

    public abstract setFileBlock(options: InsEditorAttachedFile): void;


    public abstract setIframe(options: {src: string}): void;

    public abstract setColumns(n: number): void;

    public abstract unsetColumns(): void;

    public abstract setFigure(options: {src: string, alt?: string, title?: string, caption?: string}): void;
    public abstract addCapturedImage(): void;
    public abstract addCapturedTable(): void;
    public abstract removeCapturedTable(): void;
    public abstract removeCapturedImage(): void;
    public abstract exportDocx(): Promise<Blob>;
}
