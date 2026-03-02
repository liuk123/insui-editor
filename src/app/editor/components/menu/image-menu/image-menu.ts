import { Component, inject, OnInit } from '@angular/core';
import { InsButton, InsMapperPipe } from '@liuk123/insui';
import { INS_EDITOR_OPTIONS } from '../../../common/editor-options';
import { InsTiptapEditorService } from '../../../directives/tiptap-editor/tiptap-editor.service';

@Component({
  selector: 'ins-image-menu',
  imports: [
    InsButton,
    InsMapperPipe
  ],
  templateUrl: './image-menu.html',
  styleUrl: './image-menu.less',
})
export class InsImageMenu implements OnInit {
  protected readonly options = inject(INS_EDITOR_OPTIONS);
  private editor = inject(InsTiptapEditorService);

  public ngOnInit(): void {
  }

  public get style(): string | null {
    return this.editor.getOriginTiptapEditor()?.getAttributes('image')['style'] ?? null;
  }

  protected getAppearance(style: string | null, attrStr: string): 'outline' | 'flat' {
    if (style?.replaceAll(/\s/g, '').includes(attrStr)) {
      return 'outline';
    } else {
      return 'flat';
    }
  }


  protected align(styles: string | null): void {
    this.editor.getOriginTiptapEditor()?.chain().focus().updateAttributes('image', { style: styles }).run();
  }

}
