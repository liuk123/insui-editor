import { InsEditorFontOption } from "./editor-font-option";

export function insDefaultHeadingOptionsHandler(
    texts: {
        paragraph: string;
        heading1: string;
        heading2: string;
        heading3: string;
        heading4: string;
        heading5: string;
        heading6: string;
    }
): ReadonlyArray<Partial<InsEditorFontOption>> {
    return [
        {
            name: texts.paragraph,
            // px is undefined, so it won't set font size, just setParagraph
        },
        {
            name: texts.heading1,
            headingLevel: 1,
        },
        {
            name: texts.heading2,
            headingLevel: 2,
        },
        {
            name: texts.heading3,
            headingLevel: 3,
        },
        {
            name: texts.heading4,
            headingLevel: 4,
        },
        {
            name: texts.heading5,
            headingLevel: 5,
        },
        {
            name: texts.heading6,
            headingLevel: 6,
        },
    ];
}
