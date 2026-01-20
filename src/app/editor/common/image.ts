export interface InsImageEditorOptions {
    maxWidth: number | null;
    minWidth: number | null;
}

export interface InsEditableImage {
    alt?: string;
    draggable?: '' | null;
    src: string;
    title?: string;
    width?: number | string | null;
    style?: string | null;
    'data-href'?: string | null;
    'data-editing-href'?: boolean | null;
}
