import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

export interface TemplateButtonOptions {
  HTMLAttributes: Record<string, any>;
  view: any;
}

export interface TemplateButtonAttributes {
  /**
   * The label displayed on the button
   */
  label: string;
  /**
   * The template content as JSON string
   */
  template: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    templateButton: {
      insertTemplateButton: (attributes?: Partial<TemplateButtonAttributes>) => ReturnType;
      updateTemplateButtonLabel: (label: string) => ReturnType;
      updateTemplateButtonTemplate: (template: string) => ReturnType;
      executeTemplateButton: () => ReturnType;
    };
  }
}

export const TemplateButton = Node.create<TemplateButtonOptions>({
  name: "templateButton",

  addOptions() {
    return {
      HTMLAttributes: {},
      view: null,
    };
  },

  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      label: {
        default: "New template",
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => ({
          "data-label": attributes.label,
        }),
      },
      template: {
        default: JSON.stringify([]),
        parseHTML: (element) => element.getAttribute("data-template"),
        renderHTML: (attributes) => ({
          "data-template": attributes.template,
        }),
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
        HTMLAttributes
      ),
    ];
  },

  addCommands() {
    return {
      insertTemplateButton:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },

      updateTemplateButtonLabel:
        (label: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { label }),

      updateTemplateButtonTemplate:
        (template: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { template }),

      executeTemplateButton:
        () =>
        ({ editor, state }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);

          if (!node || node.type.name !== this.name) {
            return false;
          }

          try {
            const templateContent = JSON.parse(node.attrs.template);
            const insertPos = selection.from + node.nodeSize;

            editor
              .chain()
              .focus()
              .insertContentAt(insertPos, templateContent)
              .run();

            return true;
          } catch (error) {
            console.error("Failed to parse template:", error);
            return false;
          }
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(this.options.view);
  },
});
