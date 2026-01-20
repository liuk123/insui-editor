import {type JSONContent} from '@tiptap/core';

export function insIsEmptyParagraph(json?: JSONContent[]): boolean {
    return (
        Array.isArray(json) &&
        json.length === 1 &&
        json[0]?.type === 'paragraph' &&
        !json[0].hasOwnProperty('content')
    );
}
