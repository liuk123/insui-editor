export const INS_EDITOR_LINK_HASH_PREFIX = '#';
export const INS_EDITOR_LINK_HTTP_PREFIX = 'http://';
export const INS_EDITOR_LINK_HTTPS_PREFIX = 'https://';
export const INS_EDITOR_LINK_SIMPLE_PROTOCOL_DIVIDER = ':';
export const INS_EDITOR_LINK_OSI_PROTOCOL_DIVIDER = '://';

export type InsEditorLinkProtocol =
    | `${string}${typeof INS_EDITOR_LINK_OSI_PROTOCOL_DIVIDER}`
    | `${string}${typeof INS_EDITOR_LINK_SIMPLE_PROTOCOL_DIVIDER}`;

export type InsEditorLinkPrefix =
    | InsEditorLinkProtocol
    | typeof INS_EDITOR_LINK_HASH_PREFIX;

export interface InsEditorLinkOptions {
    readonly protocol: InsEditorLinkProtocol;
}

export const INS_DEFAULT_LINK_OPTIONS = {
    protocol: INS_EDITOR_LINK_HTTPS_PREFIX,
} as const;
