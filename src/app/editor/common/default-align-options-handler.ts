import { InsEditorLabelOption } from "./editor-font-option";

export function insDefaultAlignOptionsHandler(
    texts: {
        justifyLeft: string;
        justifyCenter: string;
        justifyRight: string;
        justifyFull: string;
    }
): ReadonlyArray<Partial<InsEditorLabelOption<string>>> {
    return [
        {
            name: texts.justifyLeft,
            value: 'left',
        },
        {
            name: texts.justifyCenter,
            value: 'center',
        },
        {
            name: texts.justifyRight,
            value: 'right',
        },
        {
            name: texts.justifyFull,
            value: 'justify',
        }
    ];
}
