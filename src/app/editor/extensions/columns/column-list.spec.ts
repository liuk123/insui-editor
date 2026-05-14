import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Column } from './column';
import { ColumnList } from './column-list';

describe('ColumnList', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ColumnList, Column],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('应将列数限制在 2 到 6 之间', () => {
    editor.commands.setColumns(1);
    let node = editor.getJSON().content?.[0];
    expect(node?.type).toBe('columnList');
    expect(node?.content?.length).toBe(2);

    editor.commands.setContent('<p></p>');
    editor.commands.setColumns(8);
    node = editor.getJSON().content?.[0];
    expect(node?.type).toBe('columnList');
    expect(node?.content?.length).toBe(6);
  });
});
