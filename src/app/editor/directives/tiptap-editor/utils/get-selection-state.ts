import { AbstractInsEditor } from "../../../common/editor-adapter";


export interface InsSelectionState {
    before: string;
    after: string;
}

export function insGetSelectionState(
    editor: AbstractInsEditor | null,
): InsSelectionState {
    if (!editor?.state?.selection) {
        return {before: '', after: ''};
    }

    const {$from, $to} = editor.state.selection;

    let before = $from.nodeBefore?.textContent;

    before = (
        before?.slice((before.lastIndexOf(' ') || before.lastIndexOf('\n')) + 1) ?? ''
    ).trim();

    const after = $to.nodeAfter?.textContent.trim() ?? '';

    return {before, after};
}
