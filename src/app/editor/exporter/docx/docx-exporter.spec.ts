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
});
