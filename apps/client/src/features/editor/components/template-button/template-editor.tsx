import React, { forwardRef, useImperativeHandle, useMemo, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useFocusWithin } from "@mantine/hooks";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

// Import extensions
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Underline } from "@tiptap/extension-underline";
import { Typography } from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { ListKeymap } from "@tiptap/extension-list-keymap";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import {
  Details,
  DetailsContent,
  DetailsSummary,
  MathBlock,
  MathInline,
  TableCell,
  TableRow,
  TableHeader,
  CustomTable,
  TrailingNode,
  Callout,
  LinkExtension,
  CustomCodeBlock,
  Heading,
  Highlight,
} from "@docmost/editor-ext";
import MathInlineView from "@/features/editor/components/math/math-inline.tsx";
import MathBlockView from "@/features/editor/components/math/math-block.tsx";
import CalloutView from "@/features/editor/components/callout/callout-view.tsx";
import CodeBlockView from "@/features/editor/components/code-block/code-block-view.tsx";
import { common, createLowlight } from "lowlight";
import plaintext from "highlight.js/lib/languages/plaintext";
import renderItems from "@/features/editor/components/slash-menu/render-items";
import { SlashMenuGroupedItemsType, CommandProps } from "@/features/editor/components/slash-menu/types";
import {
  IconBlockquote,
  IconCaretRightFilled,
  IconCheckbox,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconInfoCircle,
  IconList,
  IconListNumbers,
  IconMath,
  IconMathFunction,
  IconTable,
  IconTypography,
  IconMenu4,
  IconCalendar,
} from "@tabler/icons-react";
import IconMermaid from "@/components/icons/icon-mermaid";

import classes from "./template-editor.module.css";

const lowlight = createLowlight(common);
lowlight.register("mermaid", plaintext);

// Template editor slash menu items (subset for template content)
const TemplateCommandGroups: SlashMenuGroupedItemsType = {
  basic: [
    {
      title: "Text",
      description: "Just start typing with plain text.",
      searchTerms: ["p", "paragraph"],
      icon: IconTypography,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
      },
    },
    {
      title: "To-do list",
      description: "Track tasks with a to-do list.",
      searchTerms: ["todo", "task", "list", "check", "checkbox"],
      icon: IconCheckbox,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      searchTerms: ["title", "big", "large"],
      icon: IconH1,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      searchTerms: ["subtitle", "medium"],
      icon: IconH2,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading.",
      searchTerms: ["subtitle", "small"],
      icon: IconH3,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
      },
    },
    {
      title: "Bullet list",
      description: "Create a simple bullet list.",
      searchTerms: ["unordered", "point", "list"],
      icon: IconList,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered list",
      description: "Create a list with numbering.",
      searchTerms: ["numbered", "ordered", "list"],
      icon: IconListNumbers,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      description: "Create block quote.",
      searchTerms: ["blockquote", "quotes"],
      icon: IconBlockquote,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Code",
      description: "Insert code snippet.",
      searchTerms: ["codeblock"],
      icon: IconCode,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Divider",
      description: "Insert horizontal rule divider",
      searchTerms: ["horizontal rule", "hr"],
      icon: IconMenu4,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "Table",
      description: "Insert a table.",
      searchTerms: ["table", "rows", "columns"],
      icon: IconTable,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: "Toggle block",
      description: "Insert collapsible block.",
      searchTerms: ["collapsible", "block", "toggle", "details", "expand"],
      icon: IconCaretRightFilled,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setDetails().run(),
    },
    {
      title: "Callout",
      description: "Insert callout notice.",
      searchTerms: ["callout", "notice", "panel", "info", "warning", "success", "error", "danger"],
      icon: IconInfoCircle,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleCallout().run(),
    },
    {
      title: "Math inline",
      description: "Insert inline math equation.",
      searchTerms: ["math", "inline", "equation", "katex", "latex", "tex"],
      icon: IconMathFunction,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setMathInline().setNodeSelection(range.from).run(),
    },
    {
      title: "Math block",
      description: "Insert math equation",
      searchTerms: ["math", "block", "equation", "katex", "latex", "tex"],
      icon: IconMath,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setMathBlock().run(),
    },
    {
      title: "Mermaid diagram",
      description: "Insert mermaid diagram",
      searchTerms: ["mermaid", "diagrams", "chart", "uml"],
      icon: IconMermaid,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setCodeBlock({ language: "mermaid" }).insertContent("flowchart LR\n    A --> B").run(),
    },
    {
      title: "Date",
      description: "Insert current date",
      searchTerms: ["date", "today"],
      icon: IconCalendar,
      command: ({ editor, range }: CommandProps) => {
        const currentDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        editor.chain().focus().deleteRange(range).insertContent(currentDate).run();
      },
    },
  ],
};

const getTemplateSuggestionItems = ({ query }: { query: string }): SlashMenuGroupedItemsType => {
  const search = query.toLowerCase();
  const filteredGroups: SlashMenuGroupedItemsType = {};

  const fuzzyMatch = (query: string, target: string) => {
    let queryIndex = 0;
    target = target.toLowerCase();
    for (const char of target) {
      if (query[queryIndex] === char) queryIndex++;
      if (queryIndex === query.length) return true;
    }
    return false;
  };

  for (const [group, items] of Object.entries(TemplateCommandGroups)) {
    const filteredItems = items.filter((item) => {
      return (
        fuzzyMatch(search, item.title) ||
        item.description.toLowerCase().includes(search) ||
        (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
      );
    });

    if (filteredItems.length) {
      filteredGroups[group] = filteredItems;
    }
  }

  return filteredGroups;
};

// Create slash command for template editor
const templateSlashPluginKey = new PluginKey("template-slash-command");

const TemplateSlashCommand = Extension.create({
  name: "template-slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range, props });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: templateSlashPluginKey,
        ...this.options.suggestion,
        editor: this.editor,
      }),
    ];
  },
}).configure({
  suggestion: {
    items: getTemplateSuggestionItems,
    render: renderItems,
  },
});

export interface TemplateEditorRef {
  getJSON: () => any;
  getHTML: () => string;
  setContent: (content: any) => void;
  clearContent: () => void;
}

interface TemplateEditorProps {
  initialContent?: any;
  placeholder?: string;
}

export const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(
  ({ initialContent, placeholder }, ref) => {
    const { t } = useTranslation();
    const { ref: focusRef, focused } = useFocusWithin();

    const extensions = useMemo(() => [
      StarterKit.configure({
        heading: false,
        dropcursor: {
          width: 3,
          color: "#70CFF8",
        },
        codeBlock: false,
        code: {
          HTMLAttributes: {
            spellcheck: false,
          },
        },
      }),
      Heading,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return t("Heading {{level}}", { level: node.attrs.level });
          }
          if (node.type.name === "detailsSummary") {
            return t("Toggle title");
          }
          if (node.type.name === "paragraph") {
            return placeholder || t('Type "/" for commands...');
          }
          return "";
        },
        includeChildren: true,
        showOnlyWhenEditable: true,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      ListKeymap,
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      Typography,
      TrailingNode,
      TextStyle,
      Color,
      TemplateSlashCommand,
      CustomTable.configure({
        resizable: true,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      MathInline.configure({ view: MathInlineView }),
      MathBlock.configure({ view: MathBlockView }),
      Details,
      DetailsSummary,
      DetailsContent,
      Callout.configure({ view: CalloutView }),
      CustomCodeBlock.configure({
        view: CodeBlockView,
        lowlight,
        HTMLAttributes: { spellcheck: false },
      }),
    ], [t, placeholder]);

    const editor = useEditor({
      extensions,
      editorProps: {
        attributes: {
          class: classes.editor,
        },
        handleDOMEvents: {
          keydown: (_view, event) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
              const slashMenu = document.querySelector("#slash-command");
              if (slashMenu) {
                return true;
              }
            }
            return false;
          },
        },
      },
      content: initialContent || "",
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
    });

    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON(),
      getHTML: () => editor?.getHTML() || "",
      setContent: (content: any) => {
        editor?.commands.setContent(content);
      },
      clearContent: () => {
        editor?.commands.clearContent();
      },
    }));

    useEffect(() => {
      if (editor && initialContent) {
        const currentContent = JSON.stringify(editor.getJSON());
        const newContent = JSON.stringify(initialContent);
        if (currentContent !== newContent) {
          editor.commands.setContent(initialContent);
        }
      }
    }, [editor, initialContent]);

    if (!editor) {
      return null;
    }

    return (
      <div ref={focusRef} className={clsx(classes.editorContainer, { [classes.focused]: focused })}>
        <div className={classes.editorWrapper}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default TemplateEditor;
