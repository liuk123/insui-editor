import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { InsMention } from './index';

describe('InsMention', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, InsMention],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('应插入带有 id 和 label 的 mention 节点', () => {
    editor.commands.setTextSelection(1);
    editor.commands.setMention({
      id: 'u-1',
      label: '张三',
      color: '#1890ff',
    });

    const json = editor.getJSON();
    const attrs = json.content?.[0]?.content?.[0]?.attrs as Record<string, unknown> | undefined;
    const html = editor.getHTML();

    expect(json.content?.[0]?.content?.[0]?.type).toBe('mention');
    expect(attrs?.['id']).toBe('u-1');
    expect(attrs?.['label']).toBe('张三');
    expect(html).toContain('data-mention-id="u-1"');
    expect(html).toContain('data-mention-label="张三"');
    expect(html).toContain('@张三');
  });
});
