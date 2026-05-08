import { type Command, Extension, type GlobalAttributes } from '@tiptap/core';

export type InsTableCellHorizontalAlign = 'left' | 'center' | 'right';
export type InsTableCellVerticalAlign = 'top' | 'middle' | 'bottom';

const HORIZONTAL_ALIGNMENTS: ReadonlySet<string> = new Set(['left', 'center', 'right']);
const VERTICAL_ALIGNMENTS: ReadonlySet<string> = new Set(['top', 'middle', 'bottom']);

function normalizeHorizontalAlign(value: string | null): InsTableCellHorizontalAlign | null {
  if (!value || !HORIZONTAL_ALIGNMENTS.has(value)) {
    return null;
  }

  return value as InsTableCellHorizontalAlign;
}

function normalizeVerticalAlign(value: string | null): InsTableCellVerticalAlign | null {
  if (!value || !VERTICAL_ALIGNMENTS.has(value)) {
    return null;
  }

  return value as InsTableCellVerticalAlign;
}

function parseAlignFromStyle(style: CSSStyleDeclaration): InsTableCellHorizontalAlign | null {
  return normalizeHorizontalAlign(style.textAlign || null);
}

function parseVAlignFromStyle(style: CSSStyleDeclaration): InsTableCellVerticalAlign | null {
  return normalizeVerticalAlign(style.verticalAlign || null);
}

export const TableCellAlign = Extension.create({
  name: 'tableCellAlign',
  addGlobalAttributes(): GlobalAttributes {
    return [
      {
        types: ['tableCell', 'tableHeader'],
        attributes: {
          cellAlign: {
            default: null,
            renderHTML: ({ cellAlign }) => {
              const align = normalizeHorizontalAlign(cellAlign);

              return align ? { align } : null;
            },
            parseHTML: (element) => {
              if (!(element instanceof HTMLElement)) {
                return null;
              }

              return (
                normalizeHorizontalAlign(element.getAttribute('align')) ?? parseAlignFromStyle(element.style)
              );
            },
            keepOnSplit: false,
          },
          cellVerticalAlign: {
            default: null,
            renderHTML: ({ cellVerticalAlign }) => {
              const verticalAlign = normalizeVerticalAlign(cellVerticalAlign);

              return verticalAlign ? { valign: verticalAlign } : null;
            },
            parseHTML: (element) => {
              if (!(element instanceof HTMLElement)) {
                return null;
              }

              return (
                normalizeVerticalAlign(element.getAttribute('valign')) ??
                parseVAlignFromStyle(element.style)
              );
            },
            keepOnSplit: false,
          },
        },
      },
    ];
  },

  addCommands(): {
    setCellAlign(align: InsTableCellHorizontalAlign): Command;
    unsetCellAlign(): Command;
    setCellVerticalAlign(align: InsTableCellVerticalAlign): Command;
    unsetCellVerticalAlign(): Command;
  } {
    return {
      setCellAlign:
        (align) =>
        ({ chain }) =>
          chain()
            .updateAttributes('tableCell', { cellAlign: align })
            .updateAttributes('tableHeader', { cellAlign: align })
            .run(),
      unsetCellAlign:
        () =>
        ({ chain }) =>
          chain()
            .updateAttributes('tableCell', { cellAlign: null })
            .updateAttributes('tableHeader', { cellAlign: null })
            .run(),
      setCellVerticalAlign:
        (align) =>
        ({ chain }) =>
          chain()
            .updateAttributes('tableCell', { cellVerticalAlign: align })
            .updateAttributes('tableHeader', { cellVerticalAlign: align })
            .run(),
      unsetCellVerticalAlign:
        () =>
        ({ chain }) =>
          chain()
            .updateAttributes('tableCell', { cellVerticalAlign: null })
            .updateAttributes('tableHeader', { cellVerticalAlign: null })
            .run(),
    };
  },
});
