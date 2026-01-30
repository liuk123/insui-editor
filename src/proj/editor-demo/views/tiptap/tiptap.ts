import { Component } from '@angular/core';
import { InsEditor } from '../../../../app/editor/components/editor/editor.component';
import { FormsModule } from '@angular/forms';
import { provideInsEditor } from '../../../../app/editor/providers';

@Component({
  selector: 'app-tiptap',
  imports: [
    InsEditor,
    FormsModule,
],
  templateUrl: './tiptap.html',
  styleUrl: './tiptap.less',
  providers: [
    provideInsEditor({
      placeholder: {placeholder: '请输入。。。'},
      heading: {levels: [1, 2, 3, 4, 5, 6]},
      image: true,
    }),
  ]
})
export class Tiptap {
  value = '123';
}
