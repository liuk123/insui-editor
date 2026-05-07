import type { JSONContent } from '@tiptap/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  type IParagraphOptions,
  LevelFormat,
  Packer,
  Paragraph,
  type ParagraphChild,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';

interface MarkValue {
  type?: string;
  attrs?: Record<string, unknown>;
}

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: typeof UnderlineType[keyof typeof UnderlineType];
  color?: string;
  code?: boolean;
}

interface ListContext {
  ordered: boolean;
  level: number;
}

interface InsDocxExporterOptions {
  resolveFile?: (url: string) => Promise<Blob>;
}

type DocxBlock = Paragraph | Table;

const ORDERED_LIST_REFERENCE = 'ins-editor-numbered-list';
const BULLET_LIST_REFERENCE = 'ins-editor-bullet-list';

export class InsDocxExporter {
  constructor(private readonly options: InsDocxExporterOptions = {}) {}

  public async export(json: JSONContent): Promise<Blob> {
    const blocks = this.readChildNodes(json);
    const children = await this.convertBlocks(blocks);

    const document = new Document({
      sections: [
        {
          children,
        },
      ],
      numbering: {
        config: [
          {
            reference: ORDERED_LIST_REFERENCE,
            levels: Array.from({ length: 9 }, (_, level) => ({
              level,
              start: 1,
              format: LevelFormat.DECIMAL,
              text: `%${level + 1}.`,
              alignment: AlignmentType.START,
            })),
          },
          {
            reference: BULLET_LIST_REFERENCE,
            levels: Array.from({ length: 9 }, (_, level) => ({
              level,
              start: 1,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.START,
            })),
          },
        ],
      },
    });

    return Packer.toBlob(document);
  }

  private async convertBlocks(
    nodes: readonly JSONContent[],
    listContext?: ListContext,
    quoted = false,
  ): Promise<DocxBlock[]> {
    const blocks: DocxBlock[] = [];

    for (const node of nodes) {
      const type = node.type ?? '';

      if (type === 'paragraph') {
        blocks.push(this.createParagraph(node, listContext, quoted));
        continue;
      }

      if (type === 'heading') {
        blocks.push(this.createHeading(node, quoted));
        continue;
      }

      if (type === 'bulletList' || type === 'orderedList') {
        blocks.push(
          ...(await this.convertList(node, type === 'orderedList', listContext?.level ?? 0, quoted)),
        );
        continue;
      }

      if (type === 'blockquote') {
        blocks.push(...(await this.convertBlocks(this.readChildNodes(node), undefined, true)));
        continue;
      }

      if (type === 'codeBlock') {
        blocks.push(this.createCodeBlock(node, quoted));
        continue;
      }

      if (type === 'horizontalRule') {
        blocks.push(
          new Paragraph({
            border: {
              top: { color: 'D9D9D9', size: 6, style: BorderStyle.SINGLE, space: 1 },
            },
          }),
        );
        continue;
      }

      if (type === 'image') {
        blocks.push(...(await this.createImageBlocks(node, quoted)));
        continue;
      }

      if (type === 'video') {
        blocks.push(this.createMediaPlaceholder(node, '视频', quoted));
        continue;
      }

      if (type === 'audio' || type === 'file') {
        blocks.push(this.createMediaPlaceholder(node, '附件', quoted));
        continue;
      }

      if (type === 'table') {
        blocks.push(await this.createTable(node));
        continue;
      }

      if (type === 'figcaption') {
        blocks.push(this.createCaptionParagraph(node, quoted));
        continue;
      }

      if (type === 'capturedTable' || type === 'capturedImage') {
        blocks.push(...(await this.convertBlocks(this.readChildNodes(node), listContext, quoted)));
        continue;
      }

      const fallbackChildren = this.readChildNodes(node);
      if (fallbackChildren.length > 0) {
        blocks.push(...(await this.convertBlocks(fallbackChildren, listContext, quoted)));
      }
    }

    if (blocks.length === 0) {
      blocks.push(new Paragraph({}));
    }

    return blocks;
  }

  private async convertList(
    node: JSONContent,
    ordered: boolean,
    level: number,
    quoted: boolean,
  ): Promise<Paragraph[]> {
    const paragraphs: Paragraph[] = [];
    const listItems = this.readChildNodes(node);

    for (const item of listItems) {
      if (item.type !== 'listItem') {
        continue;
      }

      const childNodes = this.readChildNodes(item);
      let hasParagraph = false;

      for (const child of childNodes) {
        if (child.type === 'paragraph') {
          hasParagraph = true;
          paragraphs.push(this.createParagraph(child, { ordered, level }, quoted));
          continue;
        }

        if (child.type === 'bulletList' || child.type === 'orderedList') {
          paragraphs.push(
            ...(await this.convertList(child, child.type === 'orderedList', level + 1, quoted)),
          );
          continue;
        }

        const nestedBlocks = await this.convertBlocks([child], { ordered, level }, quoted);
        paragraphs.push(...this.normalizeParagraphs(nestedBlocks));
      }

      if (!hasParagraph && childNodes.length === 0) {
        paragraphs.push(
          new Paragraph({
            ...this.getQuoteParagraphOptions(quoted),
            numbering: {
              reference: ordered ? ORDERED_LIST_REFERENCE : BULLET_LIST_REFERENCE,
              level,
            },
          }),
        );
      }
    }

    return paragraphs;
  }

  private createParagraph(node: JSONContent, listContext?: ListContext, quoted = false): Paragraph {
    const children = this.convertInlineNodes(this.readChildNodes(node));
    const options: IParagraphOptions = {
      ...this.getQuoteParagraphOptions(quoted),
      children: children.length > 0 ? children : [new TextRun('')],
      ...(listContext
        ? {
            numbering: {
              reference: listContext.ordered ? ORDERED_LIST_REFERENCE : BULLET_LIST_REFERENCE,
              level: listContext.level,
            },
          }
        : {}),
    };

    return new Paragraph(options);
  }

  private createHeading(node: JSONContent, quoted = false): Paragraph {
    const headingLevel = this.readHeadingLevel(node);
    return new Paragraph({
      ...this.getQuoteParagraphOptions(quoted),
      heading: headingLevel,
      children: this.convertInlineNodes(this.readChildNodes(node)),
    });
  }

  private createCodeBlock(node: JSONContent, quoted = false): Paragraph {
    const content = this.extractPlainText(node);
    const lines = content.split('\n');
    const children: TextRun[] = lines.map(
      (line, index) =>
        new TextRun({
          text: line,
          break: index > 0 ? 1 : 0,
          font: 'Consolas',
        }),
    );

    return new Paragraph({
      ...this.getQuoteParagraphOptions(quoted),
      shading: {
        fill: 'F5F5F5',
        type: ShadingType.CLEAR,
      },
      children: children.length > 0 ? children : [new TextRun('')],
    });
  }

  private createCaptionParagraph(node: JSONContent, quoted = false): Paragraph {
    const text = this.extractPlainText(node).trim();
    return this.createCaptionFromText(text, quoted);
  }

  private async createImageBlocks(node: JSONContent, quoted = false): Promise<Paragraph[]> {
    const attrs = this.readAttrs(node);
    const source = this.readStringAttr(attrs, 'src') ?? this.readStringAttr(attrs, 'url');
    const caption = this.readStringAttr(attrs, 'caption');

    if (!source) {
      return [this.createMediaPlaceholder(node, '图片', quoted)];
    }

    try {
      const blob = await this.resolveFile(source);
      const detectedType = this.detectImageType(blob.type, source);
      if (!detectedType) {
        return [this.createMediaPlaceholder(node, '图片', quoted)];
      }

      const configuredWidth = this.readNumberAttr(attrs, 'previewWidth') ?? this.readNumberAttr(attrs, 'width');
      const configuredHeight = this.readNumberAttr(attrs, 'height');
      const size = await this.resolveImageSize(blob, configuredWidth, configuredHeight);

      const imageParagraph = new Paragraph({
        ...this.getQuoteParagraphOptions(quoted),
        children: [
          new ImageRun({
            data: await blob.arrayBuffer(),
            type: detectedType,
            transformation: {
              width: size.width,
              height: size.height,
            },
          }),
        ],
      });

      if (!caption) {
        return [imageParagraph];
      }

      return [
        imageParagraph,
        this.createCaptionFromText(caption, quoted),
      ];
    } catch {
      return [this.createMediaPlaceholder(node, '图片', quoted)];
    }
  }

  private async createTable(node: JSONContent): Promise<Table> {
    const rows = this.readChildNodes(node).filter((item) => item.type === 'tableRow');
    const tableRows: TableRow[] = [];

    for (const rowNode of rows) {
      const cells = this.readChildNodes(rowNode).filter(
        (item) => item.type === 'tableCell' || item.type === 'tableHeader',
      );
      const tableCells: TableCell[] = [];

      for (const cellNode of cells) {
        const cellAttrs = this.readAttrs(cellNode);
        const rawCellBlocks = await this.convertBlocks(this.readChildNodes(cellNode));
        const cellParagraphs = this.normalizeParagraphs(rawCellBlocks);
        const columnSpan = this.readNumberAttr(cellAttrs, 'colspan') ?? 1;
        const rowSpan = this.readNumberAttr(cellAttrs, 'rowspan') ?? 1;
        const isHeader = cellNode.type === 'tableHeader';
        const shading =
          isHeader
            ? {
                type: ShadingType.CLEAR,
                fill: 'F5F5F5',
              }
            : undefined;

        tableCells.push(
          new TableCell({
            children: cellParagraphs.length > 0 ? cellParagraphs : [new Paragraph({})],
            columnSpan,
            rowSpan,
            shading,
          }),
        );
      }

      tableRows.push(
        new TableRow({
          children: tableCells,
        }),
      );
    }

    if (tableRows.length === 0) {
      tableRows.push(
        new TableRow({
          children: [new TableCell({ children: [new Paragraph({})] })],
        }),
      );
    }

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
        left: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
        right: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
      },
    });
  }

  private createMediaPlaceholder(node: JSONContent, label: string, quoted = false): Paragraph {
    const attrs = this.readAttrs(node);
    const url = this.readStringAttr(attrs, 'src') ?? this.readStringAttr(attrs, 'url');
    const caption = this.readStringAttr(attrs, 'caption');
    const text = caption ? `${label}: ${caption}` : label;
    const children: ParagraphChild[] = [new TextRun(text)];

    if (url) {
      children.push(new TextRun(' '));
      children.push(
        new ExternalHyperlink({
          link: url,
          children: [
            new TextRun({
              text: url,
              underline: { type: UnderlineType.SINGLE },
              color: '0563C1',
            }),
          ],
        }),
      );
    }

    return new Paragraph({
      ...this.getQuoteParagraphOptions(quoted),
      children,
    });
  }

  private createCaptionFromText(text: string, quoted = false): Paragraph {
    return new Paragraph({
      ...this.getQuoteParagraphOptions(quoted),
      style: 'Caption',
      children: [new TextRun({ text: text.trim() })],
      spacing: { before: 80, after: 80 },
    });
  }

  private getQuoteParagraphOptions(quoted: boolean): IParagraphOptions {
    if (!quoted) {
      return {};
    }

    return {
      indent: { left: 420 },
      border: {
        left: { color: 'BFBFBF', size: 8, style: BorderStyle.SINGLE, space: 6 },
      },
    };
  }

  private normalizeParagraphs(blocks: readonly DocxBlock[]): Paragraph[] {
    return blocks.map((block) => {
      if (block instanceof Paragraph) {
        return block;
      }
      return new Paragraph({
        children: [new TextRun('[嵌套表格]')],
      });
    });
  }

  private async resolveFile(url: string): Promise<Blob> {
    if (this.options.resolveFile) {
      return this.options.resolveFile(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Image request failed');
    }

    return response.blob();
  }

  private detectImageType(
    mimeType: string,
    source: string,
  ): 'png' | 'jpg' | 'gif' | 'bmp' | undefined {
    const normalizedMimeType = mimeType.toLowerCase();
    if (normalizedMimeType.includes('png')) return 'png';
    if (normalizedMimeType.includes('jpeg') || normalizedMimeType.includes('jpg')) return 'jpg';
    if (normalizedMimeType.includes('gif')) return 'gif';
    if (normalizedMimeType.includes('bmp')) return 'bmp';

    const lowerSource = source.toLowerCase();
    if (lowerSource.endsWith('.png')) return 'png';
    if (lowerSource.endsWith('.jpg') || lowerSource.endsWith('.jpeg')) return 'jpg';
    if (lowerSource.endsWith('.gif')) return 'gif';
    if (lowerSource.endsWith('.bmp')) return 'bmp';

    return undefined;
  }

  private async resolveImageSize(
    blob: Blob,
    configuredWidth?: number | null,
    configuredHeight?: number | null,
  ): Promise<{ width: number; height: number }> {
    const minWidth = 64;
    const maxWidth = 960;

    if (configuredWidth && configuredHeight) {
      return {
        width: Math.max(minWidth, Math.min(maxWidth, Math.round(configuredWidth))),
        height: Math.max(minWidth, Math.round(configuredHeight)),
      };
    }

    const intrinsic = await this.getImageDimensions(blob).catch(() => null);
    const fallbackWidth = configuredWidth ?? intrinsic?.width ?? 320;
    const fallbackHeight =
      configuredHeight ??
      (intrinsic ? Math.round((fallbackWidth / intrinsic.width) * intrinsic.height) : 180);

    return {
      width: Math.max(minWidth, Math.min(maxWidth, Math.round(fallbackWidth))),
      height: Math.max(minWidth, Math.round(fallbackHeight)),
    };
  }

  private async getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = 'async';

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Invalid image'));
        image.src = objectUrl;
      });

      return { width: image.naturalWidth, height: image.naturalHeight };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  private convertInlineNodes(nodes: readonly JSONContent[]): ParagraphChild[] {
    const children: ParagraphChild[] = [];

    for (const node of nodes) {
      const type = node.type ?? '';

      if (type === 'text') {
        children.push(this.createTextChild(node));
        continue;
      }

      if (type === 'hardBreak') {
        children.push(new TextRun({ break: 1, text: '' }));
        continue;
      }

      const nestedNodes = this.readChildNodes(node);
      if (nestedNodes.length > 0) {
        children.push(...this.convertInlineNodes(nestedNodes));
      }
    }

    return children;
  }

  private createTextChild(node: JSONContent): ParagraphChild {
    const text = typeof node.text === 'string' ? node.text : '';
    const marks = this.readMarks(node);
    const style = this.readTextStyle(marks);
    const link = this.readLink(marks);
    const run = new TextRun({
      text,
      bold: style.bold,
      italics: style.italic,
      strike: style.strike,
      underline: style.underline ? { type: style.underline } : undefined,
      color: style.color,
      shading: style.code
        ? {
            type: ShadingType.CLEAR,
            fill: 'F0F0F0',
          }
        : undefined,
      font: style.code ? 'Consolas' : undefined,
    });

    if (!link) {
      return run;
    }

    return new ExternalHyperlink({
      link,
      children: [run],
    });
  }

  private readTextStyle(marks: readonly MarkValue[]): TextStyle {
    const style: TextStyle = {};

    for (const mark of marks) {
      const type = mark.type ?? '';
      if (type === 'bold') {
        style.bold = true;
        continue;
      }
      if (type === 'italic') {
        style.italic = true;
        continue;
      }
      if (type === 'strike') {
        style.strike = true;
        continue;
      }
      if (type === 'underline') {
        style.underline = UnderlineType.SINGLE;
        continue;
      }
      if (type === 'code') {
        style.code = true;
        continue;
      }
      if (type === 'textStyle') {
        const attrs = mark.attrs ?? {};
        const color = this.readStringAttr(attrs, 'color') ?? this.readStringAttr(attrs, 'fontColor');
        if (color) {
          style.color = this.normalizeColor(color);
        }
      }
    }

    return style;
  }

  private readLink(marks: readonly MarkValue[]): string | null {
    for (const mark of marks) {
      if (mark.type !== 'link') {
        continue;
      }
      const href = this.readStringAttr(mark.attrs ?? {}, 'href');
      if (href) {
        return href;
      }
    }

    return null;
  }

  private normalizeColor(color: string): string | undefined {
    const normalized = color.trim().replace('#', '');
    if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return normalized.toUpperCase();
    }
    return undefined;
  }

  private extractPlainText(node: JSONContent): string {
    if (typeof node.text === 'string') {
      return node.text;
    }

    const nodes = this.readChildNodes(node);
    if (nodes.length === 0) {
      return '';
    }

    return nodes
      .map((child) => {
        if (child.type === 'hardBreak') {
          return '\n';
        }
        return this.extractPlainText(child);
      })
      .join('');
  }

  private readHeadingLevel(node: JSONContent): typeof HeadingLevel[keyof typeof HeadingLevel] {
    const attrs = this.readAttrs(node);
    const level = this.readNumberAttr(attrs, 'level');
    if (level === 1) return HeadingLevel.HEADING_1;
    if (level === 2) return HeadingLevel.HEADING_2;
    if (level === 3) return HeadingLevel.HEADING_3;
    if (level === 4) return HeadingLevel.HEADING_4;
    if (level === 5) return HeadingLevel.HEADING_5;
    if (level === 6) return HeadingLevel.HEADING_6;
    return HeadingLevel.HEADING_1;
  }

  private readChildNodes(node: JSONContent): readonly JSONContent[] {
    return Array.isArray(node.content) ? node.content : [];
  }

  private readMarks(node: JSONContent): readonly MarkValue[] {
    if (!Array.isArray(node.marks)) {
      return [];
    }

    return node.marks.filter((mark) => typeof mark === 'object' && mark !== null);
  }

  private readAttrs(node: JSONContent): Record<string, unknown> {
    return typeof node.attrs === 'object' && node.attrs !== null ? node.attrs : {};
  }

  private readStringAttr(attrs: Record<string, unknown>, key: string): string | null {
    const value = attrs[key];
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private readNumberAttr(attrs: Record<string, unknown>, key: string): number | null {
    const value = attrs[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const numberValue = Number(value);
      if (Number.isFinite(numberValue)) {
        return numberValue;
      }
    }
    return null;
  }
}
