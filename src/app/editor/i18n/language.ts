import { inject, InjectionToken } from '@angular/core';
import { InsLanguage } from '@liuk123/insui';
import { Observable, of } from 'rxjs';
import { INS_CHINESE_LANGUAGE_ADDON_EDITOR } from './addon-editor';

export interface InsLanguageEditor extends InsLanguage {
    colorSelectorModeNames: [string, string];
    editorCodeOptions: [string, string];
    editorEditLink: {
        anchorExample: string;
        urlExample: string;
    };
    // editorFontOptions: {
    //     large: string;
    //     normal: string;
    //     small: string;
    //     subtitle: string;
    //     title: string;
    // };
    editorTableCommands: [[string, string], [string, string], [string, string]];
    toolbarTools: {
        attach: string;
        backColor: string;
        bold: string;
        cellColor: string;
        clear: string;
        code: string;
        font: string;
        heading: string;
        fontSize: string;
        fontStyle: string;
        foreColor: string;
        hiliteColor: string;
        hiliteGroup: string;
        image: string;
        indent: string;
        insertAnchor: string;
        insertGroup: string;
        insertHorizontalRule: string;
        insertTable: string;
        italic: string;
        justify: string;
        justifyCenter: string;
        justifyFull: string;
        justifyLeft: string;
        justifyRight: string;
        link: string;
        list: string;
        mergeCells: string;
        orderedList: string;
        outdent: string;
        quote: string;
        redo: string;
        removeDetails: string;
        removeGroup: string;
        rowsColumnsManaging: string;
        setDetails: string;
        splitCells: string;
        strikeThrough: string;
        subscript: string;
        superscript: string;
        tex: string;
        underline: string;
        undo: string;
        unorderedList: string;
        paragraph: string;
        heading1: string;
        heading2: string;
        heading3: string;
        heading4: string;
        heading5: string;
        heading6: string;
    };
    editorHeadingOptions: {
        paragraph: string;
        heading1: string;
        heading2: string;
        heading3: string;
        heading4: string;
        heading5: string;
        heading6: string;
    };
}

export const INS_LANGUAGE_EDITOR = new InjectionToken<Observable<InsLanguageEditor>>(
    '[INS_LANGUAGE_EDITOR]',
    {
        factory: () => of(INS_CHINESE_LANGUAGE_ADDON_EDITOR),
    },
);
