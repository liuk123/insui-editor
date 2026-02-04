import { InsEditorFontOption } from "./editor-font-option";


export function insDefaultFontOptionsHandler(
    texts: {
        large: string;
        normal: string;
        small: string;
        subtitle: string;
        title: string;
    }
): ReadonlyArray<Partial<InsEditorFontOption>> {
    return [
        {
            px: 13,
            name: texts.small,
        },
        {
            px: 15,
            name: texts.normal,
        },
        {
            px: 17,
            name: texts.large,
        },
        // {
        //     px: 24,
        //     family: 'var(--ins-font-heading)',
        //     name: texts.subtitle,
        //     weight: 'bold',
        // },
        // {
        //     px: 30,
        //     family: 'var(--ins-font-heading)',
        //     name: texts.title,
        //     weight: 'bold',
        // },
    ];
}
