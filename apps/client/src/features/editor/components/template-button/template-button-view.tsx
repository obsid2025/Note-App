import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Button, TextInput, Modal, Stack, Group, ActionIcon, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings, IconTemplate } from "@tabler/icons-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import classes from "./template-button.module.css";
import TemplateEditor, { TemplateEditorRef } from "./template-editor";

export function TemplateButtonView({ node, editor, getPos }: NodeViewProps) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const [label, setLabel] = useState(node.attrs.label || "New template");
  const [initialContent, setInitialContent] = useState<any>(null);
  const editorRef = useRef<TemplateEditorRef>(null);

  // Load initial content when drawer opens
  useEffect(() => {
    if (opened) {
      try {
        const content = JSON.parse(node.attrs.template);
        if (Array.isArray(content)) {
          setInitialContent({ type: "doc", content });
        } else {
          setInitialContent(content);
        }
      } catch (error) {
        setInitialContent(null);
      }
    }
  }, [opened, node.attrs.template]);

  const handleExecute = useCallback(() => {
    if (!editor.isEditable) return;

    try {
      const templateContent = JSON.parse(node.attrs.template);
      const pos = getPos();
      if (typeof pos !== "number") return;

      const insertPos = pos + node.nodeSize;

      editor
        .chain()
        .focus()
        .insertContentAt(insertPos, templateContent)
        .run();
    } catch (error) {
      console.error("Failed to execute template:", error);
    }
  }, [editor, node, getPos]);

  const handleSaveSettings = useCallback(() => {
    const pos = getPos();
    if (typeof pos !== "number") return;

    const templateJSON = editorRef.current?.getJSON();

    if (templateJSON && templateJSON.content) {
      editor
        .chain()
        .focus()
        .updateAttributes("templateButton", {
          label,
          template: JSON.stringify(templateJSON.content),
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .updateAttributes("templateButton", { label })
        .run();
    }

    close();
  }, [editor, label, close, getPos]);

  return (
    <NodeViewWrapper className={classes.wrapper}>
      <div className={classes.container} data-drag-handle>
        <Button
          variant="light"
          color="blue"
          leftSection={<IconTemplate size={16} />}
          onClick={handleExecute}
          className={classes.button}
        >
          {node.attrs.label}
        </Button>

        {editor.isEditable && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={open}
            className={classes.settingsButton}
          >
            <IconSettings size={14} />
          </ActionIcon>
        )}
      </div>

      <Modal
        opened={opened}
        onClose={close}
        title={t("Configure Template Button")}
        size="lg"
        centered
      >
        <Stack>
          <TextInput
            label={t("Button Label")}
            placeholder={t("e.g., Add Daily Tasks")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <div>
            <Text size="sm" fw={500} mb={4}>
              {t("Template Content")}
            </Text>
            <Text size="xs" c="dimmed" mb={8}>
              {t("Create the content that will be inserted when the button is clicked")}
            </Text>
            {opened && (
              <TemplateEditor
                ref={editorRef}
                initialContent={initialContent}
                placeholder={t("Type your template content here...")}
              />
            )}
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleSaveSettings}>{t("Save")}</Button>
          </Group>
        </Stack>
      </Modal>
    </NodeViewWrapper>
  );
}

export default TemplateButtonView;
