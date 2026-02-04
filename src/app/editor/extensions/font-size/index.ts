import {Extension} from '@tiptap/core';
import { TextStyleAttributes } from '@tiptap/extension-text-style';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize(fontSize: string): ReturnType;
            /**
             * Unset the font size
             */
            unsetFontSize(): ReturnType;
        };
        textStyle: {
            /**
             * Remove spans without inline style attributes.
             * @example editor.commands.removeEmptyTextStyle()
             */
            removeEmptyTextStyle(): ReturnType;
            toggleTextStyle: (attributes?: TextStyleAttributes | undefined) => ReturnType;
        };
    }
}

export interface InsFontSizeOptions {
    types: string[];
}

export const InsFontSizeExtension = Extension.create<InsFontSizeOptions>({
    name: 'fontSize',

    addOptions(): InsFontSizeOptions {
        return {types: ['textStyle']};
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: ({style}) => style.fontSize,
                        renderHTML: ({fontSize}) =>
                            fontSize ? {style: `font-size: ${fontSize}`} : {},
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                ({chain}) =>
                    chain().setMark('textStyle', {fontSize}).run(),
            unsetFontSize:
                () =>
                ({chain}) =>
                    chain()
                        .setMark('textStyle', {fontSize: null})
                        .removeEmptyTextStyle()
                        .run(),
        };
    },
});
