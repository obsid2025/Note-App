import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

export interface DatabaseOptions {
  HTMLAttributes: Record<string, any>;
  view: any;
}

export interface DatabaseAttributes {
  databaseId?: string | null;
  viewType?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    database: {
      insertDatabase: (attributes?: DatabaseAttributes) => ReturnType;
    };
  }
}

export const Database = Node.create<DatabaseOptions>({
  name: "database",

  addOptions() {
    return {
      HTMLAttributes: {},
      view: null,
    };
  },

  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      databaseId: {
        default: null,
      },
      viewType: {
        default: "table",
      },
    };
  },

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
        { "data-type": this.name },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
    ];
  },

  addCommands() {
    return {
      insertDatabase:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(this.options.view);
  },
});
