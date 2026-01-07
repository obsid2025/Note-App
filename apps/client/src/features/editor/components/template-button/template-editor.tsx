import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Highlight } from "@tiptap/extension-highlight";
import { ActionIcon, Group, Tooltip, Divider } from "@mantine/core";
import {
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconCheckbox,
  IconBlockquote,
  IconTable,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
} from "@tabler/icons-react";

import classes from "./template-editor.module.css";

export interface TemplateEditorRef {
  getJSON: () => any;
  getHTML: () => string;
}

interface TemplateEditorProps {
  initialContent?: any;
  placeholder?: string;
}

export const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(
  ({ initialContent, placeholder = "Type your template content..." }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          dropcursor: {
            width: 3,
            color: "#70CFF8",
          },
        }),
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
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
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

    if (!editor) {
      return null;
    }

    return (
      <div className={classes.editorContainer}>
        {/* Toolbar */}
        <div className={classes.toolbar}>
          <Group gap={4}>
            {/* Text formatting */}
            <Tooltip label="Bold (Ctrl+B)">
              <ActionIcon
                variant={editor.isActive("bold") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <IconBold size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Italic (Ctrl+I)">
              <ActionIcon
                variant={editor.isActive("italic") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <IconItalic size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Underline (Ctrl+U)">
              <ActionIcon
                variant={editor.isActive("underline") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <IconUnderline size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Strikethrough">
              <ActionIcon
                variant={editor.isActive("strike") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <IconStrikethrough size={16} />
              </ActionIcon>
            </Tooltip>

            <Divider orientation="vertical" mx={4} />

            {/* Headings */}
            <Tooltip label="Heading 1">
              <ActionIcon
                variant={editor.isActive("heading", { level: 1 }) ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <IconH1 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 2">
              <ActionIcon
                variant={editor.isActive("heading", { level: 2 }) ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <IconH2 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 3">
              <ActionIcon
                variant={editor.isActive("heading", { level: 3 }) ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <IconH3 size={16} />
              </ActionIcon>
            </Tooltip>

            <Divider orientation="vertical" mx={4} />

            {/* Lists */}
            <Tooltip label="Bullet List">
              <ActionIcon
                variant={editor.isActive("bulletList") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <IconList size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Numbered List">
              <ActionIcon
                variant={editor.isActive("orderedList") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <IconListNumbers size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Task List">
              <ActionIcon
                variant={editor.isActive("taskList") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              >
                <IconCheckbox size={16} />
              </ActionIcon>
            </Tooltip>

            <Divider orientation="vertical" mx={4} />

            {/* Blocks */}
            <Tooltip label="Quote">
              <ActionIcon
                variant={editor.isActive("blockquote") ? "filled" : "subtle"}
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <IconBlockquote size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Table">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              >
                <IconTable size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </div>

        {/* Editor */}
        <div className={classes.editorWrapper}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default TemplateEditor;
