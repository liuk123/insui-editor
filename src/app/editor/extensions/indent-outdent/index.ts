import {type Editor, Extension, type KeyboardShortcutCommand} from '@tiptap/core';

export function insIsListActive(editor: Editor): boolean {
    return (
        editor.isActive('bulletList') ||
        editor.isActive('orderedList') ||
        editor.isActive('taskList')
    );
}

export const InsTabExtension = Extension.create({
    name: 'indent',

    addKeyboardShortcuts(): Record<string, KeyboardShortcutCommand> {
        return {
            Tab: () =>
                insIsListActive(this.editor)
                    ? false
                    : this.editor.commands.insertContent('\t'),
        };
    },
});
