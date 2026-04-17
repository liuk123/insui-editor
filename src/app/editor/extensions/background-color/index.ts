import { type Command, Extension, type GlobalAttributes } from '@tiptap/core';

export interface InsBackgroundColorOptions {
  types: string[];
}

export const InsBackgroundColor = Extension.create<InsBackgroundColorOptions>({
  name: 'backgroundColor',

  addOptions(): InsBackgroundColorOptions {
    return { types: ['textStyle'] };
  },

  addGlobalAttributes(): GlobalAttributes {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            renderHTML: ({ backgroundColor }) =>
              backgroundColor
                ? {
                    style: `background-color: ${backgroundColor}`,
                  }
                : {},
            parseHTML: ({ style }) => style.backgroundColor.replaceAll(/['"]+/g, ''),
            keepOnSplit: false,
          },
        },
      },
    ];
  },

  addCommands(): {
    setBackgroundColor?(backgroundColor: string): Command;
    unsetBackgroundColor?(): Command;
  } {
    return {
      setBackgroundColor:
        (backgroundColor) =>
        ({ chain }) =>
          chain().setMark('textStyle', { backgroundColor }).run(),
      unsetBackgroundColor:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { backgroundColor: null }).run(),
    };
  },
});
