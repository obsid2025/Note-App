import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import { useFocusWithin } from "@mantine/hooks";
import clsx from "clsx";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import classes from "./database-row-editor.module.css";
import { ActionIcon, Tooltip, Paper, Group } from "@mantine/core";
import { IconTrash, IconCopy, IconCut } from "@tabler/icons-react";

// Import extensions
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Underline } from "@tiptap/extension-underline";
import { Superscript } from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Typography } from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { ListKeymap } from "@tiptap/extension-list-keymap";
import { Youtube } from "@tiptap/extension-youtube";
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
  TiptapImage,
  Callout,
  TiptapVideo,
  LinkExtension,
  Attachment,
  CustomCodeBlock,
  Drawio,
  Excalidraw,
  Embed,
  Heading,
  Highlight,
  // TemplateButton,  // TODO: Re-enable after editor-ext is rebuilt
  // Columns,
  // Column,
} from "@docmost/editor-ext";
import MathInlineView from "@/features/editor/components/math/math-inline.tsx";
import MathBlockView from "@/features/editor/components/math/math-block.tsx";
import ImageView from "@/features/editor/components/image/image-view.tsx";
import CalloutView from "@/features/editor/components/callout/callout-view.tsx";
import VideoView from "@/features/editor/components/video/video-view.tsx";
import AttachmentView from "@/features/editor/components/attachment/attachment-view.tsx";
import CodeBlockView from "@/features/editor/components/code-block/code-block-view.tsx";
import DrawioView from "@/features/editor/components/drawio/drawio-view";
import ExcalidrawView from "@/features/editor/components/excalidraw/excalidraw-view.tsx";
import EmbedView from "@/features/editor/components/embed/embed-view.tsx";
// import TemplateButtonView from "@/features/editor/components/template-button/template-button-view";  // TODO: Re-enable
import { common, createLowlight } from "lowlight";
import plaintext from "highlight.js/lib/languages/plaintext";
import EmojiCommand from "@/features/editor/extensions/emoji-command";
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
  IconAppWindow,
  IconTemplate,
  IconColumns,
} from "@tabler/icons-react";
import IconMermaid from "@/components/icons/icon-mermaid";
import IconDrawio from "@/components/icons/icon-drawio";
import IconExcalidraw from "@/components/icons/icon-excalidraw";
import {
  AirtableIcon,
  FigmaIcon,
  FramerIcon,
  GoogleDriveIcon,
  GoogleSheetsIcon,
  LoomIcon,
  MiroIcon,
  TypeformIcon,
  VimeoIcon,
  YoutubeIcon,
} from "@/components/icons";

const lowlight = createLowlight(common);
lowlight.register("mermaid", plaintext);

// Database row slash menu items (excluding Database and Subpages)
const DatabaseRowCommandGroups: SlashMenuGroupedItemsType = {
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
      title: "Draw.io",
      description: "Insert and design Drawio diagrams",
      searchTerms: ["drawio", "diagrams", "charts", "uml", "whiteboard"],
      icon: IconDrawio,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setDrawio().run(),
    },
    {
      title: "Excalidraw",
      description: "Draw and sketch diagrams",
      searchTerms: ["diagrams", "draw", "sketch", "whiteboard"],
      icon: IconExcalidraw,
      command: ({ editor, range }: CommandProps) =>
        editor.chain().focus().deleteRange(range).setExcalidraw().run(),
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
    {
      title: "Iframe embed",
      description: "Embed any Iframe",
      searchTerms: ["iframe"],
      icon: IconAppWindow,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "iframe" }).run();
      },
    },
    {
      title: "Airtable",
      description: "Embed Airtable",
      searchTerms: ["airtable"],
      icon: AirtableIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "airtable" }).run();
      },
    },
    {
      title: "Loom",
      description: "Embed Loom video",
      searchTerms: ["loom"],
      icon: LoomIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "loom" }).run();
      },
    },
    {
      title: "Figma",
      description: "Embed Figma files",
      searchTerms: ["figma"],
      icon: FigmaIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "figma" }).run();
      },
    },
    {
      title: "YouTube",
      description: "Embed YouTube video",
      searchTerms: ["youtube", "yt"],
      icon: YoutubeIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "youtube" }).run();
      },
    },
    {
      title: "Vimeo",
      description: "Embed Vimeo video",
      searchTerms: ["vimeo"],
      icon: VimeoIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "vimeo" }).run();
      },
    },
    {
      title: "Google Drive",
      description: "Embed Google Drive content",
      searchTerms: ["google drive", "gdrive"],
      icon: GoogleDriveIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "gdrive" }).run();
      },
    },
    {
      title: "Google Sheets",
      description: "Embed Google Sheets content",
      searchTerms: ["google sheets", "gsheets"],
      icon: GoogleSheetsIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "gsheets" }).run();
      },
    },
    {
      title: "Typeform",
      description: "Embed Typeform",
      searchTerms: ["typeform"],
      icon: TypeformIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "typeform" }).run();
      },
    },
    {
      title: "Miro",
      description: "Embed Miro board",
      searchTerms: ["miro"],
      icon: MiroIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "miro" }).run();
      },
    },
    {
      title: "Framer",
      description: "Embed Framer prototype",
      searchTerms: ["framer"],
      icon: FramerIcon,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setEmbed({ provider: "framer" }).run();
      },
    },
    // TODO: Re-enable after editor-ext is rebuilt
    // {
    //   title: "Template Button",
    //   description: "Insert a button that generates content from a template",
    //   searchTerms: ["template", "button", "daily", "tasks", "repeat", "generate"],
    //   icon: IconTemplate,
    //   command: ({ editor, range }: CommandProps) => {
    //     editor.chain().focus().deleteRange(range).insertTemplateButton().run();
    //   },
    // },
    // {
    //   title: "2 Columns",
    //   description: "Create a 2-column layout",
    //   searchTerms: ["columns", "layout", "side", "horizontal", "two"],
    //   icon: IconColumns,
    //   command: ({ editor, range }: CommandProps) => {
    //     editor.chain().focus().deleteRange(range).insertColumns(2).run();
    //   },
    // },
    // {
    //   title: "3 Columns",
    //   description: "Create a 3-column layout",
    //   searchTerms: ["columns", "layout", "side", "horizontal", "three"],
    //   icon: IconColumns,
    //   command: ({ editor, range }: CommandProps) => {
    //     editor.chain().focus().deleteRange(range).insertColumns(3).run();
    //   },
    // },
  ],
};

const getDatabaseRowSuggestionItems = ({ query }: { query: string }): SlashMenuGroupedItemsType => {
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

  for (const [group, items] of Object.entries(DatabaseRowCommandGroups)) {
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

// Create slash command for database rows
const databaseRowSlashPluginKey = new PluginKey("database-row-slash-command");

const DatabaseRowSlashCommand = Extension.create({
  name: "database-row-slash-command",

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
        pluginKey: databaseRowSlashPluginKey,
        ...this.options.suggestion,
        editor: this.editor,
      }),
    ];
  },
}).configure({
  suggestion: {
    items: getDatabaseRowSuggestionItems,
    render: renderItems,
  },
});

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
  insertContent: (content: string) => void;
  focus: () => void;
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
      Superscript,
      SubScript,
      Highlight.configure({ multicolor: true }),
      Typography,
      TrailingNode,
      TextStyle,
      Color,
      DatabaseRowSlashCommand,
      EmojiCommand,
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
      Youtube.configure({
        addPasteHandler: false,
        controls: true,
        nocookie: true,
      }),
      TiptapImage.configure({
        view: ImageView,
        allowBase64: false,
      }),
      TiptapVideo.configure({ view: VideoView }),
      Callout.configure({ view: CalloutView }),
      CustomCodeBlock.configure({
        view: CodeBlockView,
        lowlight,
        HTMLAttributes: { spellcheck: false },
      }),
      Attachment.configure({ view: AttachmentView }),
      Drawio.configure({ view: DrawioView }),
      Excalidraw.configure({ view: ExcalidrawView }),
      Embed.configure({ view: EmbedView }),
      // TemplateButton.configure({ view: TemplateButtonView }),  // TODO: Re-enable
      // Columns,
      // Column,
    ], [t, placeholder]);

    const editor = useEditor({
      extensions,
      editorProps: {
        attributes: {
          class: "database-row-content-editor",
        },
        handleDOMEvents: {
          keydown: (_view, event) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
              const slashMenu = document.querySelector("#slash-command");
              const emojiCommand = document.querySelector("#emoji-command");
              if (slashMenu || emojiCommand) {
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
      insertContent: (content: string) => {
        editor?.chain().focus("end").insertContent(content).run();
      },
      focus: () => {
        editor?.commands.focus("end");
      },
    }));

    const handleDelete = useCallback(() => {
      if (!editor) return;
      const { from, to, empty } = editor.state.selection;
      if (!empty) {
        editor.chain().focus().deleteSelection().run();
      } else {
        // Delete the current node/block
        editor.chain().focus().selectParentNode().deleteSelection().run();
      }
    }, [editor]);

    const handleCopy = useCallback(() => {
      if (!editor) return;
      document.execCommand("copy");
    }, [editor]);

    const handleCut = useCallback(() => {
      if (!editor) return;
      document.execCommand("cut");
    }, [editor]);

    return (
      <div ref={focusRef} className={classes.editorWrapper}>
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 100,
              zIndex: 10000,
            }}
            shouldShow={({ editor, state }) => {
              const { selection } = state;
              const { empty } = selection;
              // Show when there's a selection
              return !empty && editor.isEditable;
            }}
          >
            <Paper shadow="sm" p={4} withBorder style={{ display: "flex", gap: 4 }}>
              <Tooltip label={t("Copy")}>
                <ActionIcon variant="subtle" size="sm" onClick={handleCopy}>
                  <IconCopy size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t("Cut")}>
                <ActionIcon variant="subtle" size="sm" onClick={handleCut}>
                  <IconCut size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t("Delete")}>
                <ActionIcon variant="subtle" size="sm" color="red" onClick={handleDelete}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Paper>
          </BubbleMenu>
        )}
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
