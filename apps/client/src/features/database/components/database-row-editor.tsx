import { EditorContent, useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { useFocusWithin } from "@mantine/hooks";
import clsx from "clsx";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import EmojiCommand from "@/features/editor/extensions/emoji-command";
import classes from "./database-row-editor.module.css";

interface DatabaseRowEditorProps {
  defaultContent?: any;
  onUpdate?: (content: any) => void;
  onBlur?: () => void;
  editable?: boolean;
  placeholder?: string;
  autofocus?: boolean;
}

export interface DatabaseRowEditorRef {
  clearContent: () => void;
  getJSON: () => any;
  setContent: (content: any) => void;
}

const DatabaseRowEditor = forwardRef<DatabaseRowEditorRef, DatabaseRowEditorProps>(
  (
    {
      defaultContent,
      onUpdate,
      onBlur,
      editable = true,
      placeholder,
      autofocus,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const { ref: focusRef, focused } = useFocusWithin();

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          gapcursor: false,
          dropcursor: false,
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder: placeholder || t("Type '/' for commands..."),
        }),
        Underline,
        Link.configure({
          openOnClick: false,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        EmojiCommand,
      ],
      editorProps: {
        attributes: {
          class: "database-row-content-editor",
        },
        handleDOMEvents: {
          keydown: (_view, event) => {
            if (
              [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Enter",
              ].includes(event.key)
            ) {
              const emojiCommand = document.querySelector("#emoji-command");
              if (emojiCommand) {
                return true;
              }
            }
            return false;
          },
          blur: () => {
            if (onBlur) {
              onBlur();
            }
            return false;
          },
        },
      },
      onUpdate({ editor }) {
        if (onUpdate) {
          onUpdate(editor.getJSON());
        }
      },
      content: defaultContent || "",
      editable,
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      autofocus: (autofocus && "end") || false,
    });

    useEffect(() => {
      if (editor && defaultContent) {
        const currentContent = JSON.stringify(editor.getJSON());
        const newContent = JSON.stringify(defaultContent);
        if (currentContent !== newContent) {
          editor.commands.setContent(defaultContent);
        }
      }
    }, [defaultContent, editor]);

    useEffect(() => {
      setTimeout(() => {
        if (autofocus && editor) {
          editor.commands.focus("end");
        }
      }, 10);
    }, [editor, autofocus]);

    useImperativeHandle(ref, () => ({
      clearContent: () => {
        editor?.commands.clearContent();
      },
      getJSON: () => {
        return editor?.getJSON();
      },
      setContent: (content: any) => {
        editor?.commands.setContent(content);
      },
    }));

    return (
      <div ref={focusRef} className={classes.editorWrapper}>
        <EditorContent
          editor={editor}
          className={clsx(classes.editor, { [classes.focused]: focused })}
        />
      </div>
    );
  },
);

DatabaseRowEditor.displayName = "DatabaseRowEditor";

export default DatabaseRowEditor;
