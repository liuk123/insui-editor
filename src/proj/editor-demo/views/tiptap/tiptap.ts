import { Component, DestroyRef, inject, Injectable, OnInit, signal, ViewChild } from '@angular/core';
import { InsEditor } from '../../../../app/editor/components/editor/editor.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideInsEditor } from '../../../../app/editor/providers';
import { InsDropdown, InsTextfield } from '@liuk123/insui';
import { INS_ATTACH_FILES_LOADER } from '../../../../app/editor/common/files-loader';
import { fromEvent, map, Observable, of, switchMap } from 'rxjs';
import { InsEditorAttachedFile } from '../../../../app/editor/common/attached';

@Injectable({providedIn: 'root'})
export class HttpMockUploader {
    public save(_base64: string): Observable<string> {
        return of(
            // mock
            'https://private-user-images.githubusercontent.com/20438370/398424241-231fe6f0-6c0a-481f-8856-f5da3a10f06b.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzkyNzk0ODksIm5iZiI6MTczOTI3OTE4OSwicGF0aCI6Ii8yMDQzODM3MC8zOTg0MjQyNDEtMjMxZmU2ZjAtNmMwYS00ODFmLTg4NTYtZjVkYTNhMTBmMDZiLm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAyMTElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMjExVDEzMDYyOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTM5YTQ1ZDI2ZGE5ZjQ4MzBjNmEzNTIzN2JjMjE0ZWFkYjg0OGQyYmI4NGU0NTQ0Y2Q2MjYyNWI0MmFjNDgxYTgmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.8idoj74wxtWsQgdhSL09qvWp62Mv7Mzkl3uuiDYUyD4',
        );
    }
}

@Component({
  selector: 'app-tiptap',
  imports: [InsEditor, ReactiveFormsModule, InsTextfield, InsDropdown],
  templateUrl: './tiptap.html',
  styleUrl: './tiptap.less',
  providers: [
    provideInsEditor({
      placeholder: { placeholder: '请输入' },
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      link: { autolink: true, openOnClick: false, linkOnPaste: true },
    }),
    {
      provide: INS_ATTACH_FILES_LOADER,
      deps: [HttpMockUploader],
      useFactory:
        (uploader: HttpMockUploader) =>
        ([file]: File[]): Observable<Array<InsEditorAttachedFile<{ type: string }>>> => {
          if (!file) {
            return of([]);
          }
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);

          return fromEvent<any>(fileReader, 'load').pipe(
            switchMap(() => uploader.save(String(fileReader.result))),
            map((link) => [
              {
                // Do not return base64 instead of link to binary
                // because it's bad idea for your performance

                link,
                name: file.name,
                attrs: { type: file.type },
              },
            ]),
          );
        },
    },
  ],
})
export class Tiptap implements OnInit {

  @ViewChild(InsEditor)
  private readonly wysiwyg?: InsEditor;

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
  onFileAttached(files: InsEditorAttachedFile[]) {
    console.log('files',files)
    files.forEach(file=> this.wysiwyg?.editor?.setFileLink(file))
  }
}
