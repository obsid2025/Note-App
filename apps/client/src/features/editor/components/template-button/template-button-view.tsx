import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Button, TextInput, Modal, Stack, Group, ActionIcon, Text, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings, IconTemplate } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import classes from "./template-button.module.css";

export function TemplateButtonView({ node, editor, getPos }: NodeViewProps) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const [label, setLabel] = useState(node.attrs.label || "New template");
  const [templateJson, setTemplateJson] = useState(node.attrs.template || "[]");

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

    editor
      .chain()
      .focus()
      .updateAttributes("templateButton", {
        label,
        template: templateJson,
      })
      .run();

    close();
  }, [editor, label, templateJson, close, getPos]);

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
      >
        <Stack>
          <TextInput
            label={t("Button Label")}
            placeholder={t("e.g., Add Daily Tasks")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <Textarea
            label={t("Template Content (JSON)")}
            description={t("Edit the template JSON content")}
            placeholder='[{"type": "taskList", "content": [...]}]'
            value={templateJson}
            onChange={(e) => setTemplateJson(e.target.value)}
            minRows={8}
            autosize
          />

          <Group justify="flex-end">
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
