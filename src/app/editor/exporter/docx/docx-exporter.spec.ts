import type { JSONContent } from '@tiptap/core';
import { InsDocxExporter } from './docx-exporter';

describe('InsDocxExporter', () => {
  it('should export minimal document to blob', async () => {
    const exporter = new InsDocxExporter();
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '标题' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            { type: 'text', text: 'World', marks: [{ type: 'bold' }] },
          ],
        },
      ],
    };

    const blob = await exporter.export(json);

    expect(blob instanceof Blob).toBeTrue();
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should export table and capturedTable blocks', async () => {
    const exporter = new InsDocxExporter();
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A1' }] }],
                },
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B1' }] }],
                },
              ],
            },
          ],
        },
        {
          type: 'capturedTable',
          content: [
            {
              type: 'figcaption',
              content: [{ type: 'text', text: '表格说明' }],
            },
            {
              type: 'table',
              content: [
                {
                  type: 'tableRow',
                  content: [
                    {
                      type: 'tableCell',
                      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'C1' }] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const blob = await exporter.export(json);

    expect(blob instanceof Blob).toBeTrue();
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should export image as binary with resolver', async () => {
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1,
      8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 8, 153, 99, 248, 15, 4, 0,
      9, 251, 3, 253, 167, 158, 155, 101, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);
    const imageBlob = new Blob([pngBytes], { type: 'image/png' });
    const exporter = new InsDocxExporter({
      resolveFile: async () => imageBlob,
    });
    const json: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/image.png',
            previewWidth: 240,
            height: 120,
            caption: '图片说明',
          },
        },
      ],
    };

    const blob = await exporter.export(json);

    expect(blob instanceof Blob).toBeTrue();
    expect(blob.size).toBeGreaterThan(0);
  });
});
