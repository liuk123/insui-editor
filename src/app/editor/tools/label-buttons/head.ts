import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { InsEditorOptions } from '../../common/editor-options';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { INS_EDITOR_TOOLBAR_TEXTS } from '../../common/i18n';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarBase } from '../tool-base';

@Component({
  standalone: true,
  selector: 'button[insHeadNLabel]',
  imports: [],
  template: ` {{ insHint() }} `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [],
  host: {
    '[attr.title]': 'insHint()',
    '(click)': 'setHeaderOption(head())',
  },
})
export class InsHeadNButtonLabel extends InsToolbarBase {
  public readonly head = input(null);

  protected readonly headingOptions = toSignal(
    inject(INS_EDITOR_TOOLBAR_TEXTS).pipe(map((texts) => this.options.headingOptions(texts))),
  );

  protected getHeaderIcon(headingLevel: number|null, icons?: InsEditorOptions['icons']): string {
    if (!icons) {
      return '';
    }
    if (headingLevel === 1) {
      return icons.heading1;
    }
    if (headingLevel === 2) {
      return icons.heading2;
    }
    if (headingLevel === 3) {
      return icons.heading3;
    }
    if (headingLevel === 4) {
      return icons.heading4;
    }
    if (headingLevel === 5) {
      return icons.heading5;
    }
    if (headingLevel === 6) {
      return icons.heading6;
    }
    return icons.paragraph;
  }
  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    return this.getLabel(this.head(), texts);
  }

  protected override getIcon(icons: InsEditorOptions['icons']): string {
    return this.getHeaderIcon(this.head(), icons);
  }
  protected getLabel(index: number|null, texts?: InsLanguageEditor['toolbarTools']): string {
    if (!texts) {
      return '';
    }
    if (index === 1) {
      return texts.heading1;
    }
    if (index === 2) {
      return texts.heading2;
    }
    if (index === 3) {
      return texts.heading3;
    }
    if (index === 4) {
      return texts.heading4;
    }
    if (index === 5) {
      return texts.heading5;
    }
    if (index === 6) {
      return texts.heading6;
    }
    return texts.paragraph;
  }

  protected setHeaderOption(headingLevel: number|null): void {
    if (headingLevel === null) {
      this.editor?.setParagraph();
      return;
    }
    this.editor?.setToggleHeading({ level: headingLevel });
  }
}
