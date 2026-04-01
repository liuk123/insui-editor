import { InsEditorLabelOption } from "./editor-font-option";

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
): ReadonlyArray<Partial<InsEditorLabelOption<number>>> {
    return [
        {
            name: texts.paragraph,
        },
        {
            name: texts.heading1,
            value: 1,
        },
        {
            name: texts.heading2,
            value: 2,
        },
        {
            name: texts.heading3,
            value: 3,
        },
        {
            name: texts.heading4,
            value: 4,
        },
        {
            name: texts.heading5,
            value: 5,
        },
        {
            name: texts.heading6,
            value: 6,
        },
    ];
}
