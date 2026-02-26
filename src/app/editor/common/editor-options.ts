
import {InjectionToken, type Provider} from '@angular/core';
import {type EditorOptions} from '@tiptap/core';
import {type EditorProps} from '@tiptap/pm/view';
import { insDefaultFontSizeOptionsHandler } from './default-font-options-handler';
import { insDefaultHeadingOptionsHandler } from './default-heading-options-handler';
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
    readonly fontSizeOptions: typeof insDefaultFontSizeOptionsHandler;
    readonly headingOptions: typeof insDefaultHeadingOptionsHandler;
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
        readonly dragVerticalHandle: string;
        readonly dragHorizontalHandle: string;
        readonly paragraph: string;
        readonly heading1: string;
        readonly heading2: string;
        readonly heading3: string;
        readonly heading4: string;
        readonly heading5: string;
        readonly heading6: string;
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
    fontSizeOptions: insDefaultFontSizeOptionsHandler,
    headingOptions: insDefaultHeadingOptionsHandler,
    floatingToolbar: false,
    parseOptions: {},
    icons: {
        undo: 'undo',
        redo: 'redo',
        quote: 'quote',
        link: 'link',
        anchor: 'anchor',
        attach: 'paperclip',
        sub: 'subscript',
        sup: 'superscript',
        tex: 'whole-word',
        image: 'image',
        hr: 'minus',
        clear: 'remove-formatting',
        groupAdd: 'plus',
        groupRemove: 'circle-minus',
        detailsAdd: 'copy-plus',
        detailsRemove: 'square-minus',
        popupLinkSave: 'save',
        popupLinkRemove: 'x',
        popupPreviewLinkEdit: 'pencil',
        popupPreviewLinkClear: 'trash',
        paint: 'paint-bucket',
        hash: 'hash',
        externalLink: 'external-link',
        textAlignPreview: 'align-left',
        textAlignLeft: 'align-left',
        textAlignCenter: 'align-center',
        textAlignRight: 'align-right',
        textAlignJustify: 'align-justify',
        textColor: 'baseline',
        textHilite: 'paint-roller',
        listPreview: 'list',
        listUnOrdered: 'list',
        listOrdered: 'list-ordered',
        taskList: 'check-check',
        indent: 'indent-increase',
        outdent: 'indent-decrease',
        fontSize: 'a-large-small',
        insertTable: 'table',
        tableCellMerge: 'table-cells-merge',
        tableCellSplit: 'table-rows-split',
        addRowTable: 'between-horizontal-start',
        code: 'code',
        fontStylePreview: 'type-outline',
        fontStyleBold: 'bold',
        fontStyleItalic: 'italic',
        fontStyleUnderline: 'underline',
        fontStyleStrike: 'strikethrough',
        colorSelectorDropdownChevron: 'chevron-down',
        colorSelectorDropdownCheck: 'check',
        imageExtension: {
            link: 'link',
            previewLink: 'arrow-up-right',
            previewEditLink: 'pencil-line',
            settings: 'align-left', // TODO(v5): rename settings to align
            alignJustify: 'align-justify',
            alignCenter: 'align-center',
            alignLeft: 'align-left',
            alignRight: 'align-right',
        },
        dragVerticalHandle: 'grip-vertical',
        dragHorizontalHandle: 'grip-horizontal',
        paragraph: 'pilcrow',
        heading1: 'heading-1',
        heading2: 'heading-2',
        heading3: 'heading-3',
        heading4: 'heading-4',
        heading5: 'heading-5',
        heading6: 'heading-6',
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
