import { inject, Injectable } from "@angular/core";
import { AbstractInsEditor, InsSelectionSnapshot, InsSetValueOption } from "../../common/editor-adapter";
import { type Editor, type Range } from '@tiptap/core';
import { type MarkType } from '@tiptap/pm/model';
import { distinctUntilChanged, map, Observable, startWith } from "rxjs";
import { TIPTAP_EDITOR } from "../../common/tiptap-editor";
import { insIsEmptyParagraph } from "./utils/is-empty-paragraph";
import { EditorState } from "@tiptap/pm/state";
import { insParseStyle } from "./utils/parse-style";
import { EDITOR_BLANK_COLOR } from "../../common/default-editor-colors";
import { InsEditableImage } from "../../common/image";
import { INS_EDITOR_OPTIONS } from "../../common/editor-options";
import { insGetMarkRange } from "./utils/get-mark-range";
import { InsEditorAttachedFile } from "../../common/attached";
import { InsEditableIframe } from "../../common/iframe";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type Attrs = Record<string, unknown>;

@Injectable()
export class InsTiptapEditorService extends AbstractInsEditor {
  private readonly editorRef: Observable<Editor | null> = inject(TIPTAP_EDITOR);
  protected selectionSnapshot: InsSelectionSnapshot | null = null;
  private firstInitContent = false;
  protected editor?: Editor;
  private readonly options = inject(INS_EDITOR_OPTIONS);

  constructor() {
    super()
    this.editorRef.subscribe(editor => {
      if (!editor) {
        return
      }
      this.editor = editor
      editor.on('transaction', () => {
        const json = editor.getJSON().content
        const value: string = insIsEmptyParagraph(json) ? '' : editor.getHTML()
        this.valueChange$.next(value)
      })
      // editor.on('blur', () => this.triggerTransaction())
    })
  }

  public get isFocused(): boolean {
    return this.editor?.isFocused ?? false;
  }

  public get html(): string {
    return this.editor?.getHTML() ?? '';
  }
  public get json(): any {
    return this.editor?.getJSON() ?? '';
  }

  public get editable(): boolean {
    return this.editor?.isEditable ?? false;
  }

  public set editable(editable: boolean) {
    this.editor?.setEditable(editable, false);
  }

  public get state(): EditorState | null {
    return this.editor?.state ?? null;
  }

  public getOriginTiptapEditor(): Editor | null {
    return this.editor ?? null;
  }

  public undoDisabled(): boolean {
    return !this.editor?.can().undo();
  }

  public redoDisabled(): boolean {
    return !this.editor?.can().redo();
  }

  public getFontColor(): string {
    return this.editor?.getAttributes('textStyle')['fontColor'] || EDITOR_BLANK_COLOR;
  }

  public getFontSize(): number {
    return parseInt(this.editor?.getAttributes('textStyle')['fontSize'], 10);
  }

  public setFontSize(size: number): void {
    this.editor
      ?.chain()
      .setMark('textStyle', { fontSize: size + 'px' })
      .run();
  }

  public getBackgroundColor(): string {
    return this.editor?.getAttributes('textStyle')['backgroundColor'] || 'transparent';
  }

  public getCellColor(): string {
    return (
      this.editor?.getAttributes('tableCell')['background'] ||
      this.editor?.getAttributes('tableHeader')['background'] ||
      ''
    );
  }

  public getGroupColor(): string {
    if (this.editor?.isActive('group')) {
      const style = this.editor.getAttributes('group')['style'] ?? '';
      const styles = insParseStyle(style);

      return styles['background-color'] ?? styles['background'] ?? '';
    }

    return '';
  }

  public onAlign(align: string): void {
    this.editor?.chain().focus().setTextAlign(align).run();
  }

  public setImage(src: string): void {
    this.editor
      ?.chain()
      .focus()
      .command(({ commands, state }) => {
        const setImage = ((commands as any).setEditableImage ??
          commands.setImage) as
          | ((config: InsEditableImage) => boolean)
          | undefined;

        if (setImage) {
          const anchor = state.selection.anchor;

          setImage({ src });
          commands.setTextSelection(anchor);

          return true;
        }

        return false;
      })
      .run();
  }

  public undo(): void {
    this.editor?.chain().undo().run();
  }

  public redo(): void {
    this.editor?.chain().redo().run();
  }

  public setHorizontalRule(): void {
    this.editor?.chain().focus().setHorizontalRule().run();
  }

  public removeFormat(): void {
    this.editor?.commands.unsetAllMarks();
    this.editor?.commands.clearNodes();
  }

  public setFontColor(color: string): void {
    this.editor?.chain().focus().setFontColor(color).run();
  }

  public setBackgroundColor(color: string): void {
    this.editor?.chain().focus().setBackgroundColor(color).run();
  }

  public toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  public toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  public toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  public toggleUnorderedList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  public togglePre(): void {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  public toggleTaskList(): void {
    this.editor?.chain().focus().toggleTaskList().run();
  }

  public sinkListItem(): void {
    const type = this.editor?.isActive('taskList') ? 'taskItem' : 'listItem';

    this.editor?.chain().focus().sinkListItem(type).run();
  }

  public liftListItem(): void {
    const type = this.editor?.isActive('taskList') ? 'taskItem' : 'listItem';

    this.editor?.chain().focus().liftListItem(type).run();
  }

  public isActive(attributes: Attrs): boolean;
  public isActive(name: string, attributes?: Record<string, unknown>): boolean;
  public isActive(name: Attrs | string, attributes?: Attrs): boolean {
    return (
      (typeof name === 'string'
        ? this.editor?.isActive(name, attributes)
        : this.editor?.isActive(name)) ?? false
    );
  }

  public isActive$(attributes: Attrs): Observable<boolean>;
  public isActive$(
    name: string,
    attributes?: Record<string, unknown>,
  ): Observable<boolean>;
  public isActive$(name: Attrs | string, attributes?: Attrs): Observable<boolean> {
    return this.valueChange$.pipe(
      startWith(null),
      map(() =>
        typeof name === 'string'
          ? this.isActive(name, attributes)
          : this.isActive(name),
      ),
      distinctUntilChanged(),
    );
  }

  public toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  public toggleCode(): void {
    this.editor?.chain().focus().toggleCode().run();
  }

  public toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  public toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  public toggleSubscript(): void {
    this.editor?.chain().focus().toggleSubscript().run();
  }

  public toggleSuperscript(): void {
    this.editor?.chain().focus().toggleSuperscript().run();
  }

  public toggleCodeBlock(): void {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  public insertTable(cols: number, rows: number): void {
    this.editor?.chain().focus().insertTable({ cols, rows }).run();
  }

  public addColumnAfter(): void {
    this.editor?.chain().focus().addColumnAfter().run();
  }

  public addColumnBefore(): void {
    this.editor?.chain().focus().addColumnBefore().run();
  }

  public addRowAfter(): void {
    this.editor?.chain().focus().addRowAfter().run();
  }

  public addRowBefore(): void {
    this.editor?.chain().focus().addRowBefore().run();
  }

  public deleteColumn(): void {
    this.editor?.chain().focus().deleteColumn().run();
  }

  public deleteRow(): void {
    this.editor?.chain().focus().deleteRow().run();
  }

  public mergeCells(): void {
    this.editor?.chain().focus().mergeCells().run();
  }

  public splitCell(): void {
    this.editor?.chain().focus().splitCell().run();
  }

  public canMergeCells(): boolean {
    return this.editor?.can().mergeCells() ?? false;
  }

  public canSplitCells(): boolean {
    return this.editor?.can().splitCell() ?? false;
  }

  public setHeading(level: Level): void {
    this.editor?.chain().focus().setHeading({ level }).run();
  }

  public setParagraph(options?: { fontSize: string }): void {
    this.editor?.chain().focus().setParagraph().run();

    if (options) {
      this.editor?.chain().setMark('textStyle', options).run();
    }
  }

  public setHardBreak(): void {
    this.editor?.chain().setHardBreak().run();
  }

  public setTextSelection(value: Range | number): void {
    this.editor?.commands.setTextSelection(value);
  }

  public toggleLink(href: string): void {
    this.editor?.chain().focus().toggleLink({ href }).run();
  }

  public setLink(href: string): void {
    this.editor?.chain().focus().setLink({ href }).run();
  }

  public unsetLink(): void {
    this.editor?.chain().focus().unsetLink().run();
  }

  public focus(): void {
    this.editor?.chain().focus().run();
  }

  public setValue(value: string, options: InsSetValueOption = {}): void {
    if (value === this.html || (value === '' && this.html === '<p></p>')) {
      return;
    }

    this.editor?.commands.setContent(value, this.options);

    if (options.clearsHistory || !this.firstInitContent) {
      this.clearHistory();
    }

    this.firstInitContent = true;
  }

  public clearHistory(): void {
    this.editor?.view.updateState(
      EditorState.create({
        schema: this.editor.state.schema,
        doc: this.editor.state.doc,
        selection: this.editor.state.selection,
        storedMarks: this.editor.state.storedMarks,
        plugins: this.editor.state.plugins,
      }),
    );

    this.triggerTransaction();
  }

  public destroy(): void {
    this.editor?.destroy();
  }

  public setCellColor(color: string): void {
    this.editor?.chain().focus().setCellBackground(color).run();
  }

  public selectClosest(): void {
    const pos = this.editor?.state.selection.anchor;
    const range = insGetMarkRange(
      this.editor?.state.tr.doc.resolve(pos ?? 0),
      this.editor?.schema.marks['link'],
    );

    if (range) {
      this.editor?.chain().setTextSelection(range).run();
    }
  }

  public enter(): void {
    this.editor?.commands.enter();
  }

  public setDetails(): void {
    this.editor?.commands.setDetails();
  }

  public unsetDetails(): void {
    this.editor?.commands.unsetDetails();
  }


  public setGroup(): void {
    this.editor?.commands.setGroup();
  }

  public removeGroup(): void {
    this.editor?.commands.removeGroup();
  }

  public setGroupHilite(color: string): void {
    this.editor?.commands.setGroupHilite(color);
  }

  public setAnchor(anchor: string): void {
    this.editor?.commands.setAnchor(anchor.replace('#', ''));
  }

  public removeAnchor(): void {
    this.editor?.commands.removeAnchor();
  }

  public setFileLink(preview: InsEditorAttachedFile): void {
    this.editor?.commands.setFileLink(preview);
  }

  // public setYoutubeVideo(options: TuiYoutubeOptions): void {
  //   this.editor?.commands.setYoutubeVideo(options as any);
  // }

  public setIframe(options: InsEditableIframe): void {
    this.editor?.commands.setIframe(options);
  }

  public removeEmptyTextStyle(): void {
    this.editor?.commands.removeEmptyTextStyle();
  }

  public toggleMark(
    typeOrName: MarkType | string,
    attributes?: Record<string, any>,
    options?: { extendEmptyMarkRange?: boolean },
  ): void {
    this.editor?.commands.toggleMark(typeOrName, attributes, options);
  }

  public takeSelectionSnapshot(): void {
    this.selectionSnapshot = this.editor?.state.selection.toJSON() ?? null;
  }

  public getSelectionSnapshot(): InsSelectionSnapshot | null {
    return this.selectionSnapshot;
  }
  private triggerTransaction(): void {
    this.editor?.view.dispatch(this.editor.state.tr);
  }

}
