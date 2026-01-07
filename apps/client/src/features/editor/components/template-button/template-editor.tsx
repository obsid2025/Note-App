import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";

// Core extensions
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { ListKeymap } from "@tiptap/extension-list-keymap";

import {
  Details,
  DetailsContent,
  DetailsSummary,
  CustomTable,
  TableRow,
  TableCell,
  TableHeader,
  Callout,
  Heading,
  Highlight,
  MathBlock,
  MathInline,
} from "@docmost/editor-ext";

import MathInlineView from "@/features/editor/components/math/math-inline.tsx";
import MathBlockView from "@/features/editor/components/math/math-block.tsx";
import CalloutView from "@/features/editor/components/callout/callout-view.tsx";
import renderItems from "@/features/editor/components/slash-menu/render-items";
import { SlashMenuGroupedItemsType, CommandProps } from "@/features/editor/components/slash-menu/types";

import {
  IconBlockquote,
  IconCaretRightFilled,
  IconCheckbox,
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
} from "@tabler/icons-react";

import classes from "./template-editor.module.css";

// Simplified menu items for template editor
const templateMenuItems: SlashMenuGroupedItemsType = {
  Basic: [
    {
      title: "Text",
      description: "Just start typing with plain text",
      searchTerms: ["text", "paragraph", "plain"],
      icon: IconTypography,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "Heading 1",
      description: "Large section heading",
      searchTerms: ["h1", "heading", "title", "large"],
      icon: IconH1,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      searchTerms: ["h2", "heading", "subtitle", "medium"],
      icon: IconH2,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      searchTerms: ["h3", "heading", "small"],
      icon: IconH3,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      searchTerms: ["bullet", "list", "unordered", "ul"],
      icon: IconList,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      searchTerms: ["number", "list", "ordered", "ol"],
      icon: IconListNumbers,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Task List",
      description: "Create a to-do list with checkboxes",
      searchTerms: ["task", "todo", "checkbox", "checklist"],
      icon: IconCheckbox,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "Quote",
      description: "Create a block quote",
      searchTerms: ["quote", "blockquote", "cite"],
      icon: IconBlockquote,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
  ],
  Advanced: [
    {
      title: "Callout",
      description: "Create a highlighted callout box",
      searchTerms: ["callout", "info", "warning", "note", "alert", "highlight"],
      icon: IconInfoCircle,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setCallout().run(),
    },
    {
      title: "Toggle",
      description: "Create a collapsible toggle section",
      searchTerms: ["toggle", "collapsible", "accordion", "dropdown", "expand"],
      icon: IconCaretRightFilled,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setDetails().run(),
    },
    {
      title: "Table",
      description: "Insert a table",
      searchTerms: ["table", "rows", "columns"],
      icon: IconTable,
      command: ({ editor, range }: CommandProps) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      title: "Inline Math",
      description: "Insert inline math equation",
      searchTerms: ["math", "inline", "equation", "latex", "katex"],
      icon: IconMath,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).insertMathInline().run(),
    },
    {
      title: "Block Math",
      description: "Insert block math equation",
      searchTerms: ["math", "block", "equation", "latex", "katex"],
      icon: IconMathFunction,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).insertMathBlock().run(),
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

  for (const [groupName, items] of Object.entries(templateMenuItems)) {
    const filteredItems = items.filter((item) => {
      const matchesTitle = fuzzyMatch(search, item.title);
      const matchesSearch = item.searchTerms?.some((term) =>
        fuzzyMatch(search, term)
      );
      return matchesTitle || matchesSearch;
    });

    if (filteredItems.length > 0) {
      filteredGroups[groupName] = filteredItems;
    }
  }

  return Object.keys(filteredGroups).length > 0 ? filteredGroups : templateMenuItems;
};

// Create slash command extension for template editor
const TemplateSlashCommand = Extension.create({
  name: "templateSlashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        pluginKey: new PluginKey("templateSlashCommand"),
        items: getTemplateSuggestionItems,
        render: renderItems,
      }),
    ];
  },
});

export interface TemplateEditorRef {
  getJSON: () => any;
  getHTML: () => string;
}

interface TemplateEditorProps {
  initialContent?: any;
  placeholder?: string;
}

export const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(
  ({ initialContent, placeholder = "Type / for commands..." }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          dropcursor: {
            width: 3,
            color: "#70CFF8",
          },
        }),
        Heading,
        Placeholder.configure({
          placeholder,
          showOnlyWhenEditable: true,
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        ListKeymap,
        Underline,
        Typography,
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        Details,
        DetailsSummary,
        DetailsContent,
        CustomTable.configure({
          resizable: true,
          lastColumnResizable: true,
          allowTableNodeSelection: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Callout.configure({ view: CalloutView }),
        MathInline.configure({ view: MathInlineView }),
        MathBlock.configure({ view: MathBlockView }),
        TemplateSlashCommand,
      ],
      content: initialContent || "",
      editorProps: {
        attributes: {
          class: classes.editor,
        },
      },
    });

    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON(),
      getHTML: () => editor?.getHTML() || "",
    }));

    useEffect(() => {
      if (editor && initialContent) {
        editor.commands.setContent(initialContent);
      }
    }, [editor, initialContent]);

    return (
      <div className={classes.editorWrapper}>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default TemplateEditor;
