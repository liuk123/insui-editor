import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { CommentThread, commentThreadUiPluginKey } from './index';

describe('CommentThread', () => {
  let editor: Editor;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);

    editor = new Editor({
      element: host,
      extensions: [Document, Paragraph, Text, CommentThread],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '评论引用',
                marks: [
                  {
                    type: 'commentThread',
                    attrs: {
                      threadId: 'thread-1',
                      status: 'open',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  afterEach(() => {
    editor.destroy();
    host.remove();
  });

  it('只通过 decoration 设置选中态，不写回 mark attrs', () => {
    editor.commands.setCommentThreadUiState('thread-1', 'selected');

    const pluginState = commentThreadUiPluginKey.getState(editor.state);
    const threadAttrs = editor.getJSON().content?.[0]?.content?.[0]?.marks?.[0]?.attrs as
      | Record<string, unknown>
      | undefined;

    expect(pluginState?.selectedThreadId).toBe('thread-1');
    expect(pluginState?.decorations.find().length).toBe(1);
    expect(host.querySelector('.ins-comment-thread--selected')).not.toBeNull();
    expect(editor.getHTML()).not.toContain('data-comment-thread-state');
    expect(threadAttrs?.['threadId']).toBe('thread-1');
    expect(threadAttrs?.['status']).toBe('open');
    expect(threadAttrs ? 'state' in threadAttrs : false).toBeFalse();
  });
});
