// @bad TODO: Make customizable
export interface InsEditorFontOption {
    family?: string;
    name: string;
    ngClass?: Record<string, any> | Set<string> | string[] | string;
    ngStyle?: Record<string, any>;
    px?: number;
    weight?: string;
}
export interface InsEditorHeadingOption {
    name: string,
    headingLevel: number,
}
