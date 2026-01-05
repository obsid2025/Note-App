import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Button, TextInput, Textarea, Modal, Stack, Group, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconSettings, IconTemplate } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import classes from "./template-button.module.css";

export function TemplateButtonView({ node, editor, getPos }: NodeViewProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [label, setLabel] = useState(node.attrs.label || "New template");
  const [templateText, setTemplateText] = useState("");

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
      .updateAttributes("templateButton", { label })
      .run();

    // If template text is provided, try to parse it as markdown-like format
    // and convert to JSON content
    if (templateText.trim()) {
      try {
        // Simple conversion: treat each line as a task item
        const lines = templateText.split("\n").filter((l) => l.trim());
        const content = [
          {
            type: "taskList",
            content: lines.map((line) => ({
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: line.trim() }],
                },
              ],
            })),
          },
        ];

        editor
          .chain()
          .focus()
          .updateAttributes("templateButton", {
            label,
            template: JSON.stringify(content),
          })
          .run();
      } catch (error) {
        console.error("Failed to parse template:", error);
      }
    }

    close();
  }, [editor, label, templateText, close, getPos]);

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

      <Modal opened={opened} onClose={close} title="Configure Template Button" size="md">
        <Stack>
          <TextInput
            label="Button Label"
            placeholder="e.g., Add Daily Tasks"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Textarea
            label="Template Content"
            description="Enter each task on a new line"
            placeholder="Task 1&#10;Task 2&#10;Task 3"
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            minRows={5}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </NodeViewWrapper>
  );
}

export default TemplateButtonView;
