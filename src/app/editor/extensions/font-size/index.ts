import { Extension } from '@tiptap/core';

export interface InsFontSizeOptions {
  types: string[];
}

export const InsFontSizeExtension = Extension.create<InsFontSizeOptions>({
  name: 'fontSize',

  addOptions(): InsFontSizeOptions {
    return { types: ['textStyle'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: ({ style }) => style.fontSize,
            renderHTML: ({ fontSize }) => (fontSize ? { style: `font-size: ${fontSize}` } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});
