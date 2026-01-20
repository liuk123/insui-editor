
import {InjectionToken, type Provider} from '@angular/core';
import {type EditorOptions} from '@tiptap/core';
import {type EditorProps} from '@tiptap/pm/view';
import { insDefaultFontOptionsHandler } from './default-font-options-handler';
import { INS_DEFAULT_LINK_OPTIONS, InsEditorLinkOptions } from './default-link-options-handler';
import { InsEditorToolType } from './editor-tool';
import { provideOptions } from '@liuk123/insui';
import { INS_EDITOR_DEFAULT_TOOLS } from './default-editor-tools';
import { EDITOR_BLANK_COLOR, INS_EDITOR_DEFAULT_EDITOR_COLORS } from './default-editor-colors';


export interface InsEditorOptions extends Partial<EditorOptions> {
    readonly blankColor: string;
    readonly colors: ReadonlyMap<string, string>;
    readonly textColors: ReadonlyMap<string, string> | null;
    readonly backgroundColors: ReadonlyMap<string, string> | null;
    readonly fontOptions: typeof insDefaultFontOptionsHandler;
    readonly icons: {
        readonly addRowTable: string;
        readonly anchor: string;
        readonly attach: string;
        readonly clear: string;
        readonly code: string;
        readonly colorSelectorDropdownCheck: string;
        readonly colorSelectorDropdownChevron: string;
        readonly detailsAdd: string;
        readonly detailsRemove: string;
        readonly fontSize: string;
        readonly fontStyleBold: string;
        readonly fontStyleItalic: string;
        readonly fontStylePreview: string;
        readonly fontStyleStrike: string;
        readonly fontStyleUnderline: string;
        readonly groupAdd: string;
        readonly groupRemove: string;
        readonly hr: string;
        readonly image: string;
        readonly indent: string;
        readonly insertTable: string;
        readonly tableCellMerge: string;
        readonly tableCellSplit: string;
        readonly link: string;
        readonly listOrdered: string;
        readonly taskList: string;
        readonly listPreview: string;
        readonly listUnOrdered: string;
        readonly outdent: string;
        readonly paint: string;
        readonly popupLinkRemove: string;
        readonly popupLinkSave: string;
        readonly hash: string;
        readonly externalLink: string;
        readonly popupPreviewLinkClear: string;
        readonly popupPreviewLinkEdit: string;
        readonly quote: string;
        readonly redo: string;
        readonly sub: string;
        readonly sup: string;
        readonly tex: string;
        readonly textAlignCenter: string;
        readonly textAlignJustify: string;
        readonly textAlignLeft: string;
        readonly textAlignPreview: string;
        readonly textAlignRight: string;
        readonly textColor: string;
        readonly textHilite: string;
        readonly undo: string;
        readonly imageExtension: {
            readonly link: string;
            readonly settings: string;
            readonly previewLink: string;
            readonly previewEditLink: string;
            readonly alignJustify: string;
            readonly alignCenter: string;
            readonly alignLeft: string;
            readonly alignRight: string;
        };
    };
    readonly linkOptions?: InsEditorLinkOptions;
    readonly spellcheck: boolean;
    readonly enableDefaultStyles: boolean;
    readonly translate: 'no' | 'yes';
    readonly tools: Set<InsEditorToolType> | readonly InsEditorToolType[];
    readonly floatingToolbar: boolean;
   
    readonly placeholder: string;
    readonly editorProps?: EditorProps;
}

export const INS_EDITOR_DEFAULT_OPTIONS: InsEditorOptions = {
    translate: 'no',
    spellcheck: false,
    placeholder: '',
    enableDefaultStyles: true,
    tools: INS_EDITOR_DEFAULT_TOOLS,
    colors: INS_EDITOR_DEFAULT_EDITOR_COLORS,
    textColors: null,
    backgroundColors: null,
    blankColor: EDITOR_BLANK_COLOR,
    linkOptions: INS_DEFAULT_LINK_OPTIONS,
    fontOptions: insDefaultFontOptionsHandler,
    floatingToolbar: false,
    parseOptions: {},
    icons: {
        undo: '@ins.undo',
        redo: '@ins.redo',
        quote: '@ins.quote',
        link: '@ins.link',
        anchor: '@ins.anchor',
        attach: '@ins.paperclip',
        sub: '@ins.subscript',
        sup: '@ins.superscript',
        tex: '@ins.whole-word',
        image: '@ins.image',
        hr: '@ins.minus',
        clear: '@ins.remove-formatting',
        groupAdd: '@ins.plus',
        groupRemove: '@ins.circle-minus',
        detailsAdd: '@ins.copy-plus',
        detailsRemove: '@ins.square-minus',
        popupLinkSave: '@ins.save',
        popupLinkRemove: '@ins.x',
        popupPreviewLinkEdit: '@ins.pencil',
        popupPreviewLinkClear: '@ins.x',
        paint: '@ins.paint-bucket',
        hash: '@ins.hash',
        externalLink: '@ins.external-link',
        textAlignPreview: '@ins.align-left',
        textAlignLeft: '@ins.align-left',
        textAlignCenter: '@ins.align-center',
        textAlignRight: '@ins.align-right',
        textAlignJustify: '@ins.align-justify',
        textColor: '@ins.baseline',
        textHilite: '@ins.paint-roller',
        listPreview: '@ins.list',
        listUnOrdered: '@ins.list',
        listOrdered: '@ins.list-ordered',
        taskList: '@ins.check-check',
        indent: '@ins.indent-increase',
        outdent: '@ins.indent-decrease',
        fontSize: '@ins.a-large-small',
        insertTable: '@ins.table',
        tableCellMerge: '@ins.table-cells-merge',
        tableCellSplit: '@ins.table-rows-split',
        addRowTable: '@ins.between-horizontal-start',
        code: '@ins.code',
        fontStylePreview: '@ins.type-outline',
        fontStyleBold: '@ins.bold',
        fontStyleItalic: '@ins.italic',
        fontStyleUnderline: '@ins.underline',
        fontStyleStrike: '@ins.strikethrough',
        colorSelectorDropdownChevron: '@ins.chevron-down',
        colorSelectorDropdownCheck: '@ins.check',
        imageExtension: {
            link: '@ins.link',
            previewLink: '@ins.arrow-up-right',
            previewEditLink: '@ins.pencil-line',
            settings: '@ins.align-left', // TODO(v5): rename settings to align
            alignJustify: '@ins.align-justify',
            alignCenter: '@ins.align-center',
            alignLeft: '@ins.align-left',
            alignRight: '@ins.align-right',
        },
    },
};

export const INS_EDITOR_OPTIONS = new InjectionToken(
    '',
    {
        factory: () => INS_EDITOR_DEFAULT_OPTIONS,
    },
);

export function provideInsEditorOptions(
    options: Partial<InsEditorOptions> | (() => Partial<InsEditorOptions>),
): Provider {
    return provideOptions(INS_EDITOR_OPTIONS, typeof options === 'function' ? options() : options, INS_EDITOR_DEFAULT_OPTIONS);
}
