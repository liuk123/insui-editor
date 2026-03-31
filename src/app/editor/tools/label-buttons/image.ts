import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INS_IMAGE_LOADER } from '../../common/image-loader';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insImageLabel]',
  imports: [],
  template: `
    <input #image accept="image/*" type="file" (change)="onImage(image)" style="display: none;" />
    {{ insHint() }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '(click)': 'image?.nativeElement?.click()',
  },
})
export class InsImageButtonLabel extends InsToolbarBase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly imageLoader = inject(INS_IMAGE_LOADER);

  @ViewChild('image')
  protected image?: ElementRef<HTMLInputElement>;

  protected getIcon(icons: InsEditorOptions['icons']): string {
    return icons.image;
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return texts?.image ?? '';
  }

  protected onImage(input: HTMLInputElement): void {
    const file = input.files?.[0];

    input.value = '';

    if (!file) {
      return;
    }

    this.imageLoader(file)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((image) => {
        this.editor?.setImage(image);
      });
  }
}
