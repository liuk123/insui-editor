import { INS_LANGUAGE } from '@liuk123/insui';
import { of } from 'rxjs';
import { INS_CHINESE_LANGUAGE_ADDON_EDITOR } from './addon-editor';
import {
  INS_EDITOR_CODE_OPTIONS,
  INS_EDITOR_COLOR_SELECTOR_MODE_NAMES,
  INS_EDITOR_HEADING_OPTIONS,
  INS_EDITOR_LINK_TEXTS,
  INS_EDITOR_TABLE_COMMANDS,
  INS_EDITOR_TOOLBAR_TEXTS,
} from '../common/i18n';
import { insExtractI18n } from './extract';

export const INS_EDITOR_LANGUAGE_PROVIDERS = [
  {
    provide: INS_LANGUAGE,
    useFactory: () => of(INS_CHINESE_LANGUAGE_ADDON_EDITOR),
  },
  {
    provide: INS_EDITOR_TOOLBAR_TEXTS,
    useFactory: insExtractI18n('toolbarTools'),
  },
  {
    provide: INS_EDITOR_COLOR_SELECTOR_MODE_NAMES,
    useFactory: () => ['Solid color', 'Gradient'],
  },
  {
    provide: INS_EDITOR_TABLE_COMMANDS,
    useFactory: insExtractI18n('editorTableCommands'),
  },
  {
    provide: INS_EDITOR_LINK_TEXTS,
    useFactory: insExtractI18n('editorEditLink'),
  },
  {
    provide: INS_EDITOR_CODE_OPTIONS,
    useFactory: insExtractI18n('editorCodeOptions'),
  },
  {
    provide: INS_EDITOR_HEADING_OPTIONS,
    useFactory: insExtractI18n('editorHeadingOptions'),
  },
];
