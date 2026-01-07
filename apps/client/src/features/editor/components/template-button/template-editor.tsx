import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Button, Group, Menu } from "@mantine/core";

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
  IconPlus,
  IconTable,
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
  ({ initialContent, placeholder = "Start typing your template..." }, ref) => {
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
      <div>
        <Group mb="xs" gap="xs">
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="light" size="xs" leftSection={<IconPlus size={14} />}>
                Insert Block
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Basic</Menu.Label>
              <Menu.Item
                leftSection={<IconH1 size={16} />}
                onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
              >
                Heading 1
              </Menu.Item>
              <Menu.Item
                leftSection={<IconH2 size={16} />}
                onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
              >
                Heading 2
              </Menu.Item>
              <Menu.Item
                leftSection={<IconH3 size={16} />}
                onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
              >
                Heading 3
              </Menu.Item>
              <Menu.Item
                leftSection={<IconList size={16} />}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                Bullet List
              </Menu.Item>
              <Menu.Item
                leftSection={<IconListNumbers size={16} />}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                Numbered List
              </Menu.Item>
              <Menu.Item
                leftSection={<IconCheckbox size={16} />}
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              >
                Task List
              </Menu.Item>
              <Menu.Item
                leftSection={<IconBlockquote size={16} />}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                Quote
              </Menu.Item>

              <Menu.Divider />
              <Menu.Label>Advanced</Menu.Label>
              <Menu.Item
                leftSection={<IconInfoCircle size={16} />}
                onClick={() => editor.chain().focus().setCallout().run()}
              >
                Callout
              </Menu.Item>
              <Menu.Item
                leftSection={<IconCaretRightFilled size={16} />}
                onClick={() => editor.chain().focus().setDetails().run()}
              >
                Toggle
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTable size={16} />}
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              >
                Table
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <div className={classes.editorWrapper}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default TemplateEditor;
