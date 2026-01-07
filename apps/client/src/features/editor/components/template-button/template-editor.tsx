import React, { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import tippy from "tippy.js";

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
} from "@docmost/editor-ext";

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
  IconTable,
  IconTypography,
} from "@tabler/icons-react";

import classes from "./template-editor.module.css";

// Types for slash menu
interface CommandProps {
  editor: any;
  range: any;
}

interface SlashMenuItem {
  title: string;
  description: string;
  searchTerms?: string[];
  icon: React.ComponentType<{ size?: number }>;
  command: (props: CommandProps) => void;
}

interface SlashMenuGroupedItems {
  [key: string]: SlashMenuItem[];
}

// Simplified menu items for template editor
const templateMenuItems: SlashMenuGroupedItems = {
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
  ],
};

const getTemplateSuggestionItems = ({ query }: { query: string }): SlashMenuItem[] => {
  const search = query.toLowerCase();
  const allItems: SlashMenuItem[] = [];

  const fuzzyMatch = (searchQuery: string, target: string) => {
    let queryIndex = 0;
    target = target.toLowerCase();
    for (const char of target) {
      if (searchQuery[queryIndex] === char) queryIndex++;
      if (queryIndex === searchQuery.length) return true;
    }
    return false;
  };

  for (const items of Object.values(templateMenuItems)) {
    for (const item of items) {
      const matchesTitle = fuzzyMatch(search, item.title);
      const matchesSearch = item.searchTerms?.some((term) =>
        fuzzyMatch(search, term)
      );
      if (matchesTitle || matchesSearch || search === "") {
        allItems.push(item);
      }
    }
  }

  return allItems.length > 0 ? allItems : Object.values(templateMenuItems).flat();
};

// Simple command list component for template editor
const TemplateCommandList = forwardRef(({
  items,
  command,
}: {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }), [selectedIndex, items]);

  if (!items.length) {
    return null;
  }

  return (
    <div className={classes.slashMenu}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            className={`${classes.slashMenuItem} ${index === selectedIndex ? classes.slashMenuItemSelected : ""}`}
            onClick={() => selectItem(index)}
          >
            <Icon size={18} />
            <div className={classes.slashMenuItemContent}>
              <span className={classes.slashMenuItemTitle}>{item.title}</span>
              <span className={classes.slashMenuItemDescription}>{item.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

TemplateCommandList.displayName = "TemplateCommandList";

// Simple render function for slash menu
const templateRenderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(TemplateCommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
        zIndex: 10000,
      });
    },
    onUpdate: (props: any) => {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();
        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      if (popup && !popup[0].state.isDestroyed) {
        popup[0].destroy();
      }

      if (component) {
        component.destroy();
      }
    },
  };
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
        render: templateRenderItems,
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
        Callout,
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
