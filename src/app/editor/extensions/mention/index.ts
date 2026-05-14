import { type Attributes, mergeAttributes, Node } from '@tiptap/core';
import { type DOMOutputSpec, type Node as ProseMirrorNode } from '@tiptap/pm/model';

export interface InsMentionItem {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
  readonly dataAttributes?: Record<string, string>;
}

interface InsMentionAttrs {
  readonly id?: string | null;
  readonly label?: string | null;
  readonly class?: string | null;
  readonly dataAttributes?: Record<string, string | null> | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mention: {
      setMention: (item: InsMentionItem) => ReturnType;
    };
  }
}

export interface InsMentionOptions {
  readonly HTMLAttributes: Record<string, string>;
  readonly items: ReadonlyArray<InsMentionItem>;
  readonly renderHTML: (props: {
    options: InsMentionOptions;
    node: ProseMirrorNode;
    label: string;
  }) => DOMOutputSpec;
}

const getMentionLabel = (attrs: InsMentionAttrs): string => {
  const label = `${attrs.label ?? attrs.id ?? ''}`.trim().replace(/^@+/, '');
  return label.length > 0 ? `@${label}` : '@';
};

export const InsMention = Node.create<InsMentionOptions>({
  name: 'mention',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addOptions(): InsMentionOptions {
    return {
      HTMLAttributes: {
        class: 'ins-mention',
      },
      items: [],
      renderHTML({ label }) {
        return [
          'span',
          this.HTMLAttributes,
          label,
        ];
      },
    };
  },

  addAttributes(): Attributes {
    return {
      id: {
        default: null,
        keepOnSplit: true,
        parseHTML: (element) =>
          element.getAttribute('data-mention-id') ?? '',
        renderHTML: ({ id }: InsMentionAttrs) =>
          typeof id === 'string' && id.length > 0 ? { 'data-mention-id': id } : {},
      },
      label: {
        default: null,
        keepOnSplit: true,
        parseHTML: (element) =>
          element.getAttribute('data-mention-label') ??
          element.innerText.trim().replace(/^@+/, ''),
        renderHTML: ({ label }: InsMentionAttrs) =>
          typeof label === 'string' && label.length > 0 ? { 'data-mention-label': label } : {},
      },
      class: {
        default: null,
        keepOnSplit: true,
        renderHTML: ({ class: className }: InsMentionAttrs) =>
          typeof className === 'string' && className.length > 0 ? { class: className } : {},
      },
      dataAttributes: {
        default: {},
        keepOnSplit: true,
        parseHTML: (element) =>
          element
            .getAttributeNames()
            .filter(
              (attribute) =>
                attribute.startsWith('data-') &&
                attribute !== 'data-type' &&
                attribute !== 'data-mention-id' &&
                attribute !== 'data-mention-label',
            )
            .reduce<Record<string, string | null>>(
              (attributes, attribute) => ({
                ...attributes,
                [attribute]: element.getAttribute(attribute),
              }),
              {},
            ),
        renderHTML: ({ dataAttributes }) => dataAttributes,
      },
    };
  },

  parseHTML(): [{ tag: string }] {
    return [{ tag: `span[data-type="${this.name}"]` }];
  },

  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const attrs = node.attrs as InsMentionAttrs;
    const label = getMentionLabel(attrs);
    const html = this.options.renderHTML({
      options: this.options,
      node,
      label,
    });
    const baseAttributes = mergeAttributes(
      { 'data-type': this.name },
      this.options.HTMLAttributes,
      HTMLAttributes,
    );

    if (typeof html === 'string') {
      return [
        'span',
        baseAttributes,
        html,
      ];
    }

    return [
      'span',
      baseAttributes,
      (html as readonly unknown[])?.[2] ?? label,
    ];
  },

  addCommands() {
    return {
      setMention:
        (item: InsMentionItem) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              id: item.id,
              label: item.label,
              dataAttributes: {
                ...(item.dataAttributes ?? {}),
                ...(item.color ? { 'data-mention-color': item.color } : {}),
              },
            },
          }),
    };
  },
});
