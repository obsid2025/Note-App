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
        <div className={classes.editorWrapper}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TemplateEditor.displayName = "TemplateEditor";

export default TemplateEditor;
