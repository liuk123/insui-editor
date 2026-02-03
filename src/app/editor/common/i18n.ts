import { InjectionToken } from "@angular/core";
import { insExtractI18n } from "@liuk123/insui";


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
export const INS_EDITOR_TOOLBAR_TEXTS = new InjectionToken(
    '',
    {
        factory: insExtractI18n('toolbarTools'),
    },
);

/**
 * ins-editor-toolbar table i18n
 */
export const INS_EDITOR_TABLE_COMMANDS = new InjectionToken(
    '',
    {
        factory: insExtractI18n('editorTableCommands'),
    },
);

/**
 * ins-editor-toolbar edit-link i18n
 */
export const INS_EDITOR_LINK_TEXTS = new InjectionToken(
    '',
    {
        factory: insExtractI18n('editorEditLink'),
    },
);

/**
 * ins-editor-toolbar codes options
 */
export const INS_EDITOR_CODE_OPTIONS = new InjectionToken(
    '',
    {
        factory: insExtractI18n('editorCodeOptions'),
    },
);

/**
 * ins-editor-toolbar font options
 */
export const INS_EDITOR_FONT_OPTIONS = new InjectionToken(
    '',
    {
        factory: insExtractI18n('editorFontOptions'),
    },
);

export const INS_EDITOR_HEADING_OPTIONS = new InjectionToken(
    '',
    {
        factory: insExtractI18n('editorHeadingOptions'),
    },
);