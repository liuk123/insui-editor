import { InsLinkAttributes } from "./link-attributes";


export interface InsEditorAttachedFile<T = InsLinkAttributes> {
    attrs?: T;
    link: string;
    name: string;
}

export interface InsEditorAttachOptions {
    accept: string;
    multiple: boolean;
}
