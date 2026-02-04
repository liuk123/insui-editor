
import {Extension} from '@tiptap/core';
import { InsEditorAttachedFile } from '../../common/attached';
import { InsLinkAttributes } from '../../common/link-attributes';
import { INS_TIPTAP_WHITESPACE_HACK } from '../../common/hack';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fileLink: {
            setFileLink(preview: InsEditorAttachedFile): ReturnType;
        };
    }
}

function linkAttributesToString(attrs: InsLinkAttributes): string {
    return Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
}

export const InsFileLink = Extension.create({
    name: 'fileLink',

    addCommands() {
        return {
            setFileLink:
                (fileLink) =>
                ({state, chain}) => {
                    const {selection} = state;
                    const selectedSize = Math.abs(selection.to - selection.from);
                    const attrs = fileLink.attrs
                        ? linkAttributesToString(fileLink.attrs)
                        : '';

                    return (
                        selectedSize > 0
                            ? chain()
                                  .toggleMark(
                                      'link',
                                      {href: fileLink.link},
                                      {extendEmptyMarkRange: true},
                                  )
                                  .setTextSelection(selection.to)
                                  .insertContent(INS_TIPTAP_WHITESPACE_HACK)
                            : chain().insertContent(
                                  `<a href="${fileLink.link}" ${attrs}>${fileLink.name}</a>${INS_TIPTAP_WHITESPACE_HACK}`,
                              )
                    )
                        .setTextSelection(selection.to)
                        .run();
                },
        };
    },
});
