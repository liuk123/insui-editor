import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { InsEditor } from '../../../../app/editor/components/editor/editor.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideInsEditor } from '../../../../app/editor/providers';
import { InsDropdown, InsTextfield } from '@liuk123/insui';

@Component({
  selector: 'app-tiptap',
  imports: [
    InsEditor,
    ReactiveFormsModule,
    InsTextfield,
    InsDropdown,
],
  templateUrl: './tiptap.html',
  styleUrl: './tiptap.less',
  providers: [
    provideInsEditor({
      placeholder: {placeholder: '请输入。。。'},
      heading: {levels: [1, 2, 3, 4, 5, 6]},
      link: { autolink: true, openOnClick: false, linkOnPaste: true },
    }),
  ]
})
export class Tiptap implements OnInit {

  protected control = new FormControl('');

  ngOnInit(): void {
    // this.control.valueChanges
    //   .pipe(takeUntilDestroyed(this.destroy$))
    //   .subscribe(() => {
    //     const hasSlash = !!this.wysiwyg?.selectionState.before.startsWith('/')
    //     console.log('hasSlash',hasSlash)
    //     this.open.set(!!this.wysiwyg?.isLinkSelected?false: hasSlash)
    // })
  }

}
