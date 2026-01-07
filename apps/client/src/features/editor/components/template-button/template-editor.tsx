import React, { forwardRef, useImperativeHandle, useMemo, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useFocusWithin } from "@mantine/hooks";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

// Basic extensions only
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
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import classes from "./template-editor.module.css";

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
        dropcursor: {
          width: 3,
          color: "#70CFF8",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || t("Type your template content..."),
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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ], [t, placeholder]);

    const editor = useEditor({
      extensions,
      editorProps: {
        attributes: {
          class: classes.editor,
        },
      },
      content: initialContent || "",
      immediatelyRender: false,
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
