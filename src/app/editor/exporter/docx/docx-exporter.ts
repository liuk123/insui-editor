import { inject, Injectable } from '@angular/core';
import type { JSONContent } from '@tiptap/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  type IParagraphOptions,
  LevelFormat,
  Packer,
  Paragraph,
  type ParagraphChild,
  ShadingType,
  TextRun,
  UnderlineType,
} from 'docx';
import { InsTiptapEditorService } from '../../directives/tiptap-editor/tiptap-editor.service';

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

const ORDERED_LIST_REFERENCE = 'ins-editor-numbered-list';
const BULLET_LIST_REFERENCE = 'ins-editor-bullet-list';


export class InsDocxExporter {

  public async export(json: JSONContent): Promise<Blob> {
    const blocks = this.readChildNodes(json);
    const paragraphs = this.convertBlocks(blocks);

    const document = new Document({
      sections: [
        {
          children: paragraphs,
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

  private convertBlocks(
    nodes: readonly JSONContent[],
    listContext?: ListContext,
    quoted = false,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (const node of nodes) {
      const type = node.type ?? '';

      if (type === 'paragraph') {
        paragraphs.push(this.createParagraph(node, listContext, quoted));
        continue;
      }

      if (type === 'heading') {
        paragraphs.push(this.createHeading(node, quoted));
        continue;
      }

      if (type === 'bulletList' || type === 'orderedList') {
        paragraphs.push(
          ...this.convertList(node, type === 'orderedList', listContext?.level ?? 0, quoted),
        );
        continue;
      }

      if (type === 'blockquote') {
        const quoteChildren = this.convertBlocks(this.readChildNodes(node), undefined, true);
        paragraphs.push(...quoteChildren);
        continue;
      }

      if (type === 'codeBlock') {
        paragraphs.push(this.createCodeBlock(node, quoted));
        continue;
      }

      if (type === 'horizontalRule') {
        paragraphs.push(
          new Paragraph({
            border: {
              top: { color: 'D9D9D9', size: 6, style: BorderStyle.SINGLE, space: 1 },
            },
          }),
        );
        continue;
      }

      if (type === 'image') {
        paragraphs.push(this.createMediaPlaceholder(node, '图片', quoted));
        continue;
      }

      if (type === 'video') {
        paragraphs.push(this.createMediaPlaceholder(node, '视频', quoted));
        continue;
      }

      if (type === 'audio' || type === 'file') {
        paragraphs.push(this.createMediaPlaceholder(node, '附件', quoted));
        continue;
      }

      const fallbackChildren = this.readChildNodes(node);
      if (fallbackChildren.length > 0) {
        paragraphs.push(...this.convertBlocks(fallbackChildren, listContext, quoted));
      }
    }

    if (paragraphs.length === 0) {
      paragraphs.push(new Paragraph({}));
    }

    return paragraphs;
  }

  private convertList(node: JSONContent, ordered: boolean, level: number, quoted: boolean): Paragraph[] {
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
          paragraphs.push(...this.convertList(child, child.type === 'orderedList', level + 1, quoted));
          continue;
        }

        paragraphs.push(...this.convertBlocks([child], { ordered, level }, quoted));
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

  private readHeadingLevel(node: JSONContent):  typeof HeadingLevel[keyof typeof HeadingLevel] {
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
