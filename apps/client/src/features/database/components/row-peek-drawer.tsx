import { Drawer, TextInput, ActionIcon, Text, Stack, Group, Divider, Textarea, Badge } from "@mantine/core";
import { IconX, IconMaximize, IconFileDescription } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { rowPeekAtom } from "../atoms/database-atoms";
import { useDatabaseQuery, useDatabaseRowQuery, useUpdateDatabaseRowMutation, useUpdateDatabaseRowContentMutation } from "../queries/database-query";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { PropertyType, PropertyDefinition } from "../types/database.types";
import { useNavigate, useParams } from "react-router-dom";

interface PropertyEditorProps {
  property: PropertyDefinition;
  value: any;
  onChange: (value: any) => void;
}

function PropertyEditor({ property, value, onChange }: PropertyEditorProps) {
  switch (property.type) {
    case PropertyType.CHECKBOX:
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ cursor: "pointer" }}
        />
      );

    case PropertyType.SELECT:
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="">Select...</option>
          {property.options?.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.value}
            </option>
          ))}
        </select>
      );

    case PropertyType.MULTI_SELECT:
      const selectedIds = Array.isArray(value) ? value : [];
      return (
        <Group gap="xs">
          {property.options?.map((opt) => (
            <Badge
              key={opt.id}
              variant={selectedIds.includes(opt.id) ? "filled" : "outline"}
              style={{ cursor: "pointer", backgroundColor: selectedIds.includes(opt.id) ? opt.color : undefined }}
              onClick={() => {
                const newValue = selectedIds.includes(opt.id)
                  ? selectedIds.filter((id: string) => id !== opt.id)
                  : [...selectedIds, opt.id];
                onChange(newValue);
              }}
            >
              {opt.value}
            </Badge>
          ))}
        </Group>
      );

    case PropertyType.DATE:
      return (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      );

    case PropertyType.NUMBER:
      return (
        <TextInput
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case PropertyType.URL:
      return (
        <TextInput
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      );

    case PropertyType.EMAIL:
      return (
        <TextInput
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="email@example.com"
        />
      );

    default:
      return (
        <TextInput
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export default function RowPeekDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceSlug } = useParams();
  const [rowPeekState, setRowPeekState] = useAtom(rowPeekAtom);
  const { isOpen, rowId, databaseId } = rowPeekState;

  const { data: database } = useDatabaseQuery(databaseId);
  const { data: row } = useDatabaseRowQuery(rowId);

  const updateRowMutation = useUpdateDatabaseRowMutation();
  const updateContentMutation = useUpdateDatabaseRowContentMutation();

  const [title, setTitle] = useState("");
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [content, setContent] = useState("");

  useEffect(() => {
    if (row) {
      setTitle(row.title || "");
      setProperties(row.properties || {});
      setContent(row.content ? JSON.stringify(row.content, null, 2) : "");
    }
  }, [row]);

  const handleClose = useCallback(() => {
    setRowPeekState({ isOpen: false, rowId: null, databaseId: null });
  }, [setRowPeekState]);

  const handleTitleBlur = useCallback(() => {
    if (rowId && title !== row?.title) {
      updateRowMutation.mutate({ rowId, title });
    }
  }, [rowId, title, row?.title, updateRowMutation]);

  const handlePropertyChange = useCallback((propertyId: string, value: any) => {
    setProperties((prev) => ({ ...prev, [propertyId]: value }));
    if (rowId) {
      const updatedProperties = { ...properties, [propertyId]: value };
      updateRowMutation.mutate({
        rowId,
        properties: JSON.stringify({ [propertyId]: value }),
      });
    }
  }, [rowId, properties, updateRowMutation]);

  const handleContentBlur = useCallback(() => {
    if (rowId && content) {
      try {
        const parsedContent = JSON.parse(content);
        updateContentMutation.mutate({ rowId, content: JSON.stringify(parsedContent) });
      } catch {
        // Invalid JSON, skip update
      }
    }
  }, [rowId, content, updateContentMutation]);

  const handleOpenFullPage = useCallback(() => {
    // For now, just close the peek - full page view would navigate to a dedicated row page
    // This can be implemented later with a dedicated route like /s/:spaceSlug/db/:databaseSlug/row/:rowSlug
    handleClose();
  }, [handleClose]);

  return (
    <Drawer
      opened={isOpen}
      onClose={handleClose}
      position="right"
      size="lg"
      withCloseButton={false}
      padding="md"
      title={
        <Group justify="space-between" w="100%">
          <Group gap="xs">
            <IconFileDescription size={18} />
            <Text fw={600}>{t("Row Details")}</Text>
          </Group>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={handleOpenFullPage} title={t("Open as full page")}>
              <IconMaximize size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" onClick={handleClose}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Group>
      }
    >
      {row && (
        <Stack gap="md">
          <TextInput
            label={t("Title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder={t("Untitled")}
            size="md"
            styles={{ input: { fontWeight: 600, fontSize: 18 } }}
          />

          <Divider label={t("Properties")} labelPosition="left" />

          {database?.properties.map((prop) => (
            <div key={prop.id}>
              <Text size="sm" fw={500} mb={4} c="dimmed">
                {prop.name}
              </Text>
              <PropertyEditor
                property={prop}
                value={properties[prop.id]}
                onChange={(value) => handlePropertyChange(prop.id, value)}
              />
            </div>
          ))}

          <Divider label={t("Content")} labelPosition="left" />

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
            placeholder={t("Add content (JSON format)...")}
            minRows={6}
            autosize
            description={t("Rich text editor coming soon. For now, use JSON format.")}
          />
        </Stack>
      )}
    </Drawer>
  );
}
