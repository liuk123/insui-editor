import { Schema } from '@tiptap/pm/model';
import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state';
import { buildEditorSelectionContext } from './selection-context';

describe('buildEditorSelectionContext', () => {
  const schema = new Schema({
    nodes: {
      doc: {
        content: 'block+',
      },
      paragraph: {
        group: 'block',
        content: 'text*',
        toDOM: () => ['p', 0],
      },
      image: {
        group: 'block',
        atom: true,
        attrs: {
          src: {},
        },
        toDOM: (node) => ['img', { src: node.attrs['src'] }],
      },
      text: {
        group: 'inline',
      },
    },
  });

  it('为文本选区生成活动块上下文', () => {
    const paragraph = schema.node('paragraph', null, [schema.text('hello')]);
    const doc = schema.node('doc', null, [paragraph]);
    const state = EditorState.create({
      schema,
      doc,
      selection: TextSelection.create(doc, 2),
    });

    const context = buildEditorSelectionContext(state);

    expect(context.kind).toBe('text');
    expect(context.activeBlock?.node).toBe('paragraph');
    expect(context.activeBlock?.nodePos).toBe(0);
    expect(context.anchorPath.length).toBe(1);
  });

  it('为节点选区保留被选中的原子块节点', () => {
    const paragraph = schema.node('paragraph', null, [schema.text('hello')]);
    const image = schema.node('image', { src: 'demo.png' });
    const doc = schema.node('doc', null, [paragraph, image]);
    const imagePos = paragraph.nodeSize + 1;
    const state = EditorState.create({
      schema,
      doc,
      selection: NodeSelection.create(doc, imagePos),
    });

    const context = buildEditorSelectionContext(state);

    expect(context.kind).toBe('node');
    expect(context.activeNode?.node).toBe('image');
    expect(context.activeNode?.nodePos).toBe(imagePos);
    expect(context.activeBlock?.node).toBe('image');
  });
});
