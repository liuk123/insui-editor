import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import {
  InsChevron,
  InsDataList,
  InsDropdownDirective,
  InsOption,
  InsTextfield,
  InsTextfieldDropdownDirective,
  InsWithDropdownOpen,
} from '@liuk123/insui';
import { InsEditorOptions } from '../../common/editor-options';
import { InsLanguageEditor } from '../../i18n/language';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';

type TurnIntoType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeBlock';

interface TurnIntoOption {
  type: TurnIntoType;
  label: string;
}
interface TurnIntoOptionGroup {
  label: string;
  options: TurnIntoOption[];
}

@Component({
  standalone: true,
  selector: 'button[insTurnIntoTool]',
  imports: [InsDataList, InsOption, InsTextfield],
  template: `
    {{ insHint() }}
    <ng-container *insTextfieldDropdown>
        <ins-data-list style="width: 12rem;">
          @for (group of turnIntoOptions(); track group.label) {
           <ins-opt-group label="{{ group.label }}">
            @for (item of group.options; track $index) {
            <button
              insOption
              type="button"
              [class.turn-into-active]="isOptionActive(item.type)"
              (click)="setOption(item.type)"
            >
              {{ item.label }}
            </button>
          }
          </ins-opt-group>
          }
        </ins-data-list>
    </ng-container>
  `,
  styles: [
    `
      .turn-into-active {
        font-weight: bold;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen, InsChevron],
  host: {
    '[attr.automation-id]': '"toolbar__turn-into-button"',
    '[attr.title]': 'insHint()',
  },
})
export class InsTurnIntoButtonTool extends InsToolbarTool {
  private readonly dropdown = inject(InsDropdownDirective);

  protected readonly dropdownTemplate = viewChild(InsTextfieldDropdownDirective, { read: TemplateRef });
  protected readonly bindDropdown = effect(() => {
    this.dropdown.insDropdown = this.dropdownTemplate();
  });

  protected readonly turnIntoOptions = computed(() => {
    const texts = this.texts();

    return this.buildOptions(texts);
  });

  constructor() {
    super();
    this.editorChange$.subscribe(() => {
      this.syncPresentation();
    });
  }

  protected getIcon(icons: InsEditorOptions['icons']): string {
    const type = this.getActiveType();
    const iconMap: Record<TurnIntoType, string> = {
      paragraph: icons.paragraph,
      heading1: icons.heading1,
      heading2: icons.heading2,
      heading3: icons.heading3,
      heading4: icons.heading4,
      heading5: icons.heading5,
      bulletList: icons.listUnOrdered,
      orderedList: icons.listOrdered,
      taskList: icons.taskList,
      blockquote: icons.quote,
      codeBlock: icons.codeBlock,
    };

    return iconMap[type];
  }

  protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
    const options = this.buildOptions(texts);
    const activeType = this.getActiveType();

    return options.find((group) => group.options.some((item) => item.type === activeType))?.label ?? '';
  }

  protected setOption(type: TurnIntoType): void {
    switch (type) {
      case 'paragraph':
        this.editor?.setParagraph(undefined);
        return;
      case 'heading1':
        this.editor?.setHeading(1);
        return;
      case 'heading2':
        this.editor?.setHeading(2);
        return;
      case 'heading3':
        this.editor?.setHeading(3);
        return;
      case 'heading4':
        this.editor?.setHeading(4);
        return;
      case 'heading5':
        this.editor?.setHeading(5);
        return;
      case 'bulletList':
        if (!this.editor?.isActive('bulletList')) {
          this.editor?.toggleUnorderedList();
        }
        return;
      case 'orderedList':
        if (!this.editor?.isActive('orderedList')) {
          this.editor?.toggleOrderedList();
        }
        return;
      case 'taskList':
        if (!this.editor?.isActive('taskList')) {
          this.editor?.toggleTaskList();
        }
        return;
      case 'blockquote':
        if (!this.editor?.isActive('blockquote')) {
          this.editor?.toggleBlockquote();
        }
        return;
      case 'codeBlock':
        if (!this.editor?.isActive('codeBlock')) {
          this.editor?.toggleCodeBlock();
        }
        return;
      default:
        return;
    }
  }

  protected isOptionActive(type: TurnIntoType): boolean {
    return this.getActiveType() === type;
  }

  private getActiveType(): TurnIntoType {
    if (this.editor?.isActive('heading', { level: 1 })) {
      return 'heading1';
    }
    if (this.editor?.isActive('heading', { level: 2 })) {
      return 'heading2';
    }
    if (this.editor?.isActive('heading', { level: 3 })) {
      return 'heading3';
    }
    if (this.editor?.isActive('heading', { level: 4 })) {
      return 'heading4';
    }
    if (this.editor?.isActive('heading', { level: 5 })) {
      return 'heading5';
    }
    if (this.editor?.isActive('bulletList')) {
      return 'bulletList';
    }
    if (this.editor?.isActive('orderedList')) {
      return 'orderedList';
    }
    if (this.editor?.isActive('taskList')) {
      return 'taskList';
    }
    if (this.editor?.isActive('blockquote')) {
      return 'blockquote';
    }
    if (this.editor?.isActive('codeBlock')) {
      return 'codeBlock';
    }

    return 'paragraph';
  }

  private buildOptions(texts?: InsLanguageEditor['toolbarTools']): TurnIntoOptionGroup[] {
    return [
      {
        label: '段落',
        options: [
          { type: 'paragraph', label: texts?.paragraph ?? 'Text' },
          { type: 'heading1', label: texts?.heading1 ?? 'Heading 1' },
          { type: 'heading2', label: texts?.heading2 ?? 'Heading 2' },
          { type: 'heading3', label: texts?.heading3 ?? 'Heading 3' },
          { type: 'heading4', label: texts?.heading4 ?? 'Heading 4' },
          { type: 'heading5', label: texts?.heading5 ?? 'Heading 5' },
        ],
      },
      {
        label: '更多',
        options: [
          { type: 'bulletList', label: texts?.unorderedList ?? 'Bulleted list' },
          { type: 'orderedList', label: texts?.orderedList ?? 'Numbered list' },
          { type: 'taskList', label: texts?.taskList ?? 'To-do list' },
          { type: 'blockquote', label: texts?.quote ?? 'Blockquote' },
          { type: 'codeBlock', label: texts?.codeBlock ?? 'Code block' },
        ],
      },
    ];
  }

  private syncPresentation(): void {
    if (this.iconDir) {
      this.iconDir.iconStart = this.getIcon(this.options.icons);
    }
    this.insHint.set(this.getHint(this.texts()));
  }
}
