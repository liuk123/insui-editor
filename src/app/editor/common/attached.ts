import { InsLinkAttributes } from "./link-attributes";


export interface InsEditorAttachedFile {
  src: string;
  name?: string;
  caption?: string;
}

export interface InsEditorAttachOptions {
    accept: string;
    multiple: boolean;
}
