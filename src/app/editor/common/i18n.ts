import { InjectionToken } from "@angular/core";
import { InsLanguageEditor } from "../i18n/language";
import { Observable } from "rxjs";


/**
 * ins-color-selector i18n
 */
export const INS_EDITOR_COLOR_SELECTOR_MODE_NAMES = new InjectionToken<[string, string]>(
    '',
    {
        factory: () => ['Solid color', 'Gradient'],
    },
);

/**
 * ins-editor-toolbar i18n
 */
export const INS_EDITOR_TOOLBAR_TEXTS = new InjectionToken<Observable<InsLanguageEditor['toolbarTools']>>(
    ''
);

/**
 * ins-editor-toolbar table i18n
 */
export const INS_EDITOR_TABLE_COMMANDS = new InjectionToken<Observable<InsLanguageEditor['editorTableCommands']>>(
    ''
);

/**
 * ins-editor-toolbar edit-link i18n
 */
export const INS_EDITOR_LINK_TEXTS = new InjectionToken<Observable<InsLanguageEditor['editorEditLink']>>(
    ''
);

/**
 * ins-editor-toolbar codes options
 */
export const INS_EDITOR_CODE_OPTIONS = new InjectionToken<Observable<InsLanguageEditor['editorCodeOptions']>>(
    ''
);


export const INS_EDITOR_HEADING_OPTIONS = new InjectionToken<Observable<InsLanguageEditor['editorHeadingOptions']>>(
    ''
);
