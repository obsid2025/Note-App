import React, { useEffect, forwardRef, useImperativeHandle, useState, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import {
  Paper,
  ScrollArea,
  Text,
  UnstyledButton,
  Group,
  ActionIcon,
  Portal,
} from "@mantine/core";

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
  IconList,
  IconListNumbers,
  IconTable,
  IconTypography,
} from "@tabler/icons-react";

import classes from "./template-editor.module.css";

// Types
interface CommandProps {
  editor: any;
  range: any;
}

interface SlashMenuItem {
  title: string;
  description: string;
  searchTerms?: string[];
  icon: React.FC<{ size?: number | string }>;
  command: (props: CommandProps) => void;
}

// Menu items
const menuItems: SlashMenuItem[] = [
  {
    title: "Text",
    description: "Plain text paragraph",
    searchTerms: ["text", "paragraph", "plain"],
    icon: IconTypography,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    searchTerms: ["h1", "heading", "title", "large"],
    icon: IconH1,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    searchTerms: ["h2", "heading", "subtitle", "medium"],
    icon: IconH2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    searchTerms: ["h3", "heading", "small"],
    icon: IconH3,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Create a bullet list",
    searchTerms: ["bullet", "list", "unordered", "ul"],
    icon: IconList,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    searchTerms: ["number", "list", "ordered", "ol"],
    icon: IconListNumbers,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Create a to-do list",
    searchTerms: ["task", "todo", "checkbox", "checklist"],
    icon: IconCheckbox,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Create a block quote",
    searchTerms: ["quote", "blockquote", "cite"],
    icon: IconBlockquote,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Toggle",
    description: "Collapsible toggle section",
    searchTerms: ["toggle", "collapsible", "accordion"],
    icon: IconCaretRightFilled,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setDetails().run(),
  },
  {
    title: "Table",
    description: "Insert a table",
    searchTerms: ["table", "rows", "columns"],
    icon: IconTable,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

// Filter items based on query
const filterItems = (query: string): SlashMenuItem[] => {
  const search = query.toLowerCase();
  if (!search) return menuItems;

  return menuItems.filter((item) => {
    const matchesTitle = item.title.toLowerCase().includes(search);
    const matchesSearch = item.searchTerms?.some((term) =>
      term.toLowerCase().includes(search)
    );
    return matchesTitle || matchesSearch;
  });
};

// Slash menu state for React rendering
interface SlashMenuState {
  isOpen: boolean;
  items: SlashMenuItem[];
  selectedIndex: number;
  position: { top: number; left: number } | null;
  command: ((item: SlashMenuItem) => void) | null;
}

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
    const [slashMenu, setSlashMenu] = useState<SlashMenuState>({
      isOpen: false,
      items: [],
      selectedIndex: 0,
      position: null,
      command: null,
    });

    const closeMenu = useCallback(() => {
      setSlashMenu({
        isOpen: false,
        items: [],
        selectedIndex: 0,
        position: null,
        command: null,
      });
    }, []);

    const selectItem = useCallback((index: number) => {
      const item = slashMenu.items[index];
      if (item && slashMenu.command) {
        slashMenu.command(item);
        closeMenu();
      }
    }, [slashMenu, closeMenu]);

    // Create the slash command extension with React-based rendering
    const TemplateSlashCommand = useMemo(() => Extension.create({
      name: "templateSlashCommand",

      addOptions() {
        return {
          suggestion: {
            char: "/",
            command: ({ editor, range, props }: { editor: any; range: any; props: SlashMenuItem }) => {
              props.command({ editor, range });
            },
          },
        };
      },

      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: "/",
            pluginKey: new PluginKey("templateSlashCommand"),
            items: ({ query }) => filterItems(query),
            command: ({ editor, range, props }) => {
              props.command({ editor, range });
            },
            render: () => {
              return {
                onStart: (props: SuggestionProps<SlashMenuItem>) => {
                  const rect = props.clientRect?.();
                  if (rect) {
                    setSlashMenu({
                      isOpen: true,
                      items: props.items,
                      selectedIndex: 0,
                      position: { top: rect.bottom + 8, left: rect.left },
                      command: (item: SlashMenuItem) => props.command({ props: item } as any),
                    });
                  }
                },
                onUpdate: (props: SuggestionProps<SlashMenuItem>) => {
                  const rect = props.clientRect?.();
                  setSlashMenu((prev) => ({
                    ...prev,
                    items: props.items,
                    selectedIndex: 0,
                    position: rect ? { top: rect.bottom + 8, left: rect.left } : prev.position,
                    command: (item: SlashMenuItem) => props.command({ props: item } as any),
                  }));
                },
                onKeyDown: (props: SuggestionKeyDownProps) => {
                  if (props.event.key === "Escape") {
                    closeMenu();
                    return true;
                  }

                  if (props.event.key === "ArrowUp") {
                    setSlashMenu((prev) => ({
                      ...prev,
                      selectedIndex: (prev.selectedIndex + prev.items.length - 1) % prev.items.length,
                    }));
                    return true;
                  }

                  if (props.event.key === "ArrowDown") {
                    setSlashMenu((prev) => ({
                      ...prev,
                      selectedIndex: (prev.selectedIndex + 1) % prev.items.length,
                    }));
                    return true;
                  }

                  if (props.event.key === "Enter") {
                    setSlashMenu((prev) => {
                      const item = prev.items[prev.selectedIndex];
                      if (item && prev.command) {
                        // Use setTimeout to avoid state update during render
                        setTimeout(() => {
                          prev.command?.(item);
                          closeMenu();
                        }, 0);
                      }
                      return prev;
                    });
                    return true;
                  }

                  return false;
                },
                onExit: () => {
                  closeMenu();
                },
              };
            },
          }),
        ];
      },
    }), [closeMenu]);

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
        TemplateSlashCommand,
      ],
      content: initialContent || "",
      editorProps: {
        attributes: {
          class: classes.editor,
        },
      },
    }, [TemplateSlashCommand]);

    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON(),
      getHTML: () => editor?.getHTML() || "",
    }));

    useEffect(() => {
      if (editor && initialContent) {
        editor.commands.setContent(initialContent);
      }
    }, [editor, initialContent]);

    if (!editor) {
      return null;
    }

    return (
      <div className={classes.editorContainer}>
        <div className={classes.editorWrapper}>
          <EditorContent editor={editor} />
        </div>

        {/* Slash Menu rendered via Portal to ensure proper z-index */}
        {slashMenu.isOpen && slashMenu.position && slashMenu.items.length > 0 && (
          <Portal>
            <Paper
              shadow="md"
              p="xs"
              withBorder
              className={classes.slashMenu}
              style={{
                position: "fixed",
                top: slashMenu.position.top,
                left: slashMenu.position.left,
                zIndex: 10000,
              }}
            >
              <ScrollArea h={300} w={260} scrollbarSize={8}>
                {slashMenu.items.map((item, index) => (
                  <UnstyledButton
                    key={item.title}
                    onClick={() => selectItem(index)}
                    className={`${classes.menuItem} ${index === slashMenu.selectedIndex ? classes.menuItemSelected : ""}`}
                    w="100%"
                  >
                    <Group gap="sm">
                      <ActionIcon variant="default" component="div" size="md">
                        <item.icon size={16} />
                      </ActionIcon>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {item.title}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {item.description}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                ))}
              </ScrollArea>
            </Paper>
          </Portal>
        )}
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default TemplateEditor;
