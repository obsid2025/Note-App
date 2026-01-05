import { Node, mergeAttributes } from "@tiptap/core";

export interface ColumnsOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      insertColumns: (count?: number) => ReturnType;
      addColumn: () => ReturnType;
      removeColumn: () => ReturnType;
    };
  }
}

export const Columns = Node.create<ColumnsOptions>({
  name: "columns",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",
  content: "column+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        {
          "data-type": this.name,
          style: "display: flex; gap: 1rem; width: 100%;",
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addCommands() {
    return {
      insertColumns:
        (count = 2) =>
        ({ commands }) => {
          const columns = Array.from({ length: count }, () => ({
            type: "column",
            content: [{ type: "paragraph" }],
          }));

          return commands.insertContent({
            type: this.name,
            content: columns,
          });
        },

      addColumn:
        () =>
        ({ state, chain }) => {
          // Find parent columns node and add a column
          const { selection } = state;
          const pos = selection.$from;

          for (let depth = pos.depth; depth > 0; depth--) {
            const node = pos.node(depth);
            if (node.type.name === this.name) {
              const endPos = pos.end(depth);
              return chain()
                .insertContentAt(endPos, {
                  type: "column",
                  content: [{ type: "paragraph" }],
                })
                .run();
            }
          }
          return false;
        },

      removeColumn:
        () =>
        ({ state, commands }) => {
          const { selection } = state;
          const pos = selection.$from;

          for (let depth = pos.depth; depth > 0; depth--) {
            const node = pos.node(depth);
            if (node.type.name === "column") {
              // Don't remove if it's the last column
              const parent = pos.node(depth - 1);
              if (parent.childCount <= 1) {
                return false;
              }

              const start = pos.before(depth);
              const end = pos.after(depth);
              return commands.deleteRange({ from: start, to: end });
            }
          }
          return false;
        },
    };
  },
});

export const Column = Node.create({
  name: "column",

  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        {
          "data-type": this.name,
          style: "flex: 1; min-width: 0;",
        },
        HTMLAttributes
      ),
      0,
    ];
  },
});
