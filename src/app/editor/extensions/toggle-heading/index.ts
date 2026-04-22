import { type KeyboardShortcutCommand, mergeAttributes } from '@tiptap/core';
import { Heading, Level, type HeadingOptions } from '@tiptap/extension-heading';
import { type Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type ViewMutationRecord } from '@tiptap/pm/view';

interface CollapsibleHeadingOptions extends HeadingOptions {
  allowToggleHeadings: boolean;
}

interface BlockEntry {
  readonly node: ProsemirrorNode;
  readonly pos: number;
}

const COLLAPSED_BLOCK_CLASS = 'ins-heading-collapsed-content';
const DEFAULT_LEVELS: Level[] = [1, 2, 3, 4, 5, 6];
const collapsibleHeadingPluginKey = new PluginKey('ins-collapsible-heading');

function getSafeHeadingLevel(node: ProsemirrorNode): number {
  const level = node.attrs['level'];
  if (typeof level === 'number' && level >= 1 && level <= 6) {
    return level;
  }
  return 1;
}

function isHeadingNode(node: ProsemirrorNode): boolean {
  return node.type.name === 'heading';
}

function isCollapsedHeading(node: ProsemirrorNode): boolean {
  return (
    isHeadingNode(node) &&
    node.attrs['toggleable'] !== false &&
    Boolean(node.attrs['collapsed'])
  );
}

function getCollapsedDecorations(doc: ProsemirrorNode): DecorationSet {
  const blocks: BlockEntry[] = [];
  const headings: Array<BlockEntry & { readonly level: number }> = [];
  const decorations: Decoration[] = [];

  doc.forEach((node, offset) => {
    const block = { node, pos: offset } as const;
    blocks.push(block);

    if (isHeadingNode(node)) {
      headings.push({ ...block, level: getSafeHeadingLevel(node) });
    }
  });

  headings.forEach((heading, index) => {
    if (!isCollapsedHeading(heading.node)) {
      return;
    }

    const start = heading.pos + heading.node.nodeSize;
    let end = doc.content.size;

    for (let pointer = index + 1; pointer < headings.length; pointer += 1) {
      if (headings[pointer].level <= heading.level) {
        end = headings[pointer].pos;
        break;
      }
    }

    if (start >= end) {
      return;
    }

    blocks.forEach((block) => {
      if (block.pos >= start && block.pos < end) {
        decorations.push(
          Decoration.node(block.pos, block.pos + block.node.nodeSize, {
            class: COLLAPSED_BLOCK_CLASS,
          }),
        );
      }
    });
  });

  return DecorationSet.create(doc, decorations);
}

export const InsToggleHeading = Heading.extend<CollapsibleHeadingOptions>({
  addOptions() {
    return {
      ...(this.parent?.() ?? {}),
      allowToggleHeadings: true,
      levels: DEFAULT_LEVELS,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      collapsed: {
        default: false,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-collapsed': attributes['collapsed'] ? 'true' : undefined,
        }),
      },
      toggleable: {
        default: true,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-toggleable') !== 'false',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-toggleable': attributes['toggleable'] === false ? 'false' : undefined,
        }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = getSafeHeadingLevel(node);

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const wrapper = document.createElement('div');
      wrapper.className = 'ins-toggle-heading-wrapper';

      const toggleButton = document.createElement('button');
      toggleButton.className = 'ins-toggle-heading-button';
      toggleButton.type = 'button';
      toggleButton.setAttribute('aria-label', '折叠标题内容');
      toggleButton.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6z"/></svg>';

      const contentDOM = document.createElement(`h${getSafeHeadingLevel(currentNode)}`);
      contentDOM.className = 'ins-toggle-heading-content';

      const syncCollapsedState = (): void => {
        const collapsed = isCollapsedHeading(currentNode);
        const expanded = !collapsed;

        wrapper.setAttribute('data-collapsed', collapsed ? 'true' : 'false');
        toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        toggleButton.hidden = this.options.allowToggleHeadings
          ? currentNode.attrs['toggleable'] === false
          : true;
      };

      const toggleButtonMouseDown = (event: MouseEvent): void => {
        event.preventDefault();
      };

      const toggleButtonOnClick = (event: MouseEvent): void => {
        event.preventDefault();
        const nodePos = getPos();

        if (typeof nodePos !== 'number') {
          return;
        }

        const targetNode = editor.state.doc.nodeAt(nodePos);
        if (!targetNode || !isHeadingNode(targetNode)) {
          return;
        }

        const nextCollapsed = !Boolean(targetNode.attrs['collapsed']);

        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            if (!dispatch) {
              return true;
            }

            tr.setNodeMarkup(nodePos, undefined, {
              ...targetNode.attrs,
              collapsed: nextCollapsed,
            });
            return true;
          })
          .run();
      };

      toggleButton.addEventListener('mousedown', toggleButtonMouseDown);
      toggleButton.addEventListener('click', toggleButtonOnClick);
      wrapper.append(toggleButton, contentDOM);
      syncCollapsedState();

      return {
        dom: wrapper,
        contentDOM,
        update: (updatedNode: ProsemirrorNode): boolean => {
          if (updatedNode.type !== currentNode.type) {
            return false;
          }

          if (getSafeHeadingLevel(updatedNode) !== getSafeHeadingLevel(currentNode)) {
            return false;
          }

          currentNode = updatedNode;
          syncCollapsedState();
          return true;
        },
        ignoreMutation: (mutation: ViewMutationRecord): boolean =>
          mutation instanceof MutationRecord &&
          mutation.type === 'attributes' &&
          mutation.target === wrapper &&
          mutation.attributeName === 'data-collapsed',
        destroy: () => {
          toggleButton.removeEventListener('mousedown', toggleButtonMouseDown);
          toggleButton.removeEventListener('click', toggleButtonOnClick);
        },
      };
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.allowToggleHeadings) {
      return this.parent?.() ?? [];
    }

    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: collapsibleHeadingPluginKey,
        props: {
          decorations: ({ doc }) => getCollapsedDecorations(doc),
        },
      }),
    ];
  },

  addKeyboardShortcuts(): Record<string, KeyboardShortcutCommand> {
    const levels = this.options.levels?.length ? this.options.levels : DEFAULT_LEVELS;

    return levels.reduce<Record<string, KeyboardShortcutCommand>>((items, level) => {
      items[`Mod-Alt-${level}`] = () => this.editor.commands.toggleHeading({ level });
      return items;
    }, {});
  },
});
