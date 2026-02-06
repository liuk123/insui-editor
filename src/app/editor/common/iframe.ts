export interface InsEditableIframeOptions {
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}

export interface InsEditableIframe {
  allowfullscreen?: boolean | null;
  frameborder?: number | null;
  height?: number | string | null;
  src: string | null;
  width?: number | string | null;
}
