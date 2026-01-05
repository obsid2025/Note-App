import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Text, Loader, Center, ActionIcon, Menu, Tooltip } from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconFileDescription,
  IconDatabase,
  IconTextSize,
  IconHash,
  IconList,
  IconCalendar,
  IconCheckbox,
  IconLink,
  IconAt,
  IconUser,
  IconPaperclip,
  IconFunction,
  IconArrowsLeftRight,
  IconDots,
} from "@tabler/icons-react";
import { useDatabaseQuery, useDatabaseRowsQuery, useCreateDatabaseRowMutation, useUpdateDatabaseMutation, useDeleteDatabaseMutation, useAddPropertyMutation, useUpdateDatabaseRowMutation, useDeleteDatabaseRowMutation } from "../queries/database-query";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { rowPeekAtom } from "../atoms/database-atoms";
import { PropertyType, IDatabase, IDatabaseRow, PropertyDefinition } from "../types/database.types";
import classes from "./database-view.module.css";
import RowPeekDrawer from "./row-peek-drawer";

const propertyTypeIcons: Record<PropertyType, typeof IconTextSize> = {
  [PropertyType.TEXT]: IconTextSize,
  [PropertyType.NUMBER]: IconHash,
  [PropertyType.SELECT]: IconList,
  [PropertyType.MULTI_SELECT]: IconList,
  [PropertyType.DATE]: IconCalendar,
  [PropertyType.CHECKBOX]: IconCheckbox,
  [PropertyType.URL]: IconLink,
  [PropertyType.EMAIL]: IconAt,
  [PropertyType.PERSON]: IconUser,
  [PropertyType.FILES]: IconPaperclip,
  [PropertyType.FORMULA]: IconFunction,
  [PropertyType.RELATION]: IconArrowsLeftRight,
};

const propertyTypeLabels: Record<PropertyType, string> = {
  [PropertyType.TEXT]: "Text",
  [PropertyType.NUMBER]: "Number",
  [PropertyType.SELECT]: "Select",
  [PropertyType.MULTI_SELECT]: "Multi-select",
  [PropertyType.DATE]: "Date",
  [PropertyType.CHECKBOX]: "Checkbox",
  [PropertyType.URL]: "URL",
  [PropertyType.EMAIL]: "Email",
  [PropertyType.PERSON]: "Person",
  [PropertyType.FILES]: "Files",
  [PropertyType.FORMULA]: "Formula",
  [PropertyType.RELATION]: "Relation",
};

interface TableCellProps {
  property: PropertyDefinition;
  value: any;
  rowId: string;
  databaseId: string;
  onUpdate: (rowId: string, propertyId: string, value: any) => void;
}

function TableCell({ property, value, rowId, databaseId, onUpdate }: TableCellProps) {
  const [editValue, setEditValue] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditValue(value ?? "");
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onUpdate(rowId, property.id, editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setEditValue(value ?? "");
      setIsEditing(false);
    }
  };

  switch (property.type) {
    case PropertyType.CHECKBOX:
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onUpdate(rowId, property.id, e.target.checked)}
          className={classes.checkbox}
        />
      );

    case PropertyType.SELECT:
      const option = property.options?.find((o) => o.id === value);
      return (
        <span
          className={classes.tag}
          style={{ backgroundColor: option?.color || "#e0e0e0" }}
        >
          {option?.value || ""}
        </span>
      );

    case PropertyType.MULTI_SELECT:
      const selectedIds = Array.isArray(value) ? value : [];
      return (
        <>
          {selectedIds.map((id: string) => {
            const opt = property.options?.find((o) => o.id === id);
            return opt ? (
              <span
                key={id}
                className={classes.tag}
                style={{ backgroundColor: opt.color || "#e0e0e0" }}
              >
                {opt.value}
              </span>
            ) : null;
          })}
        </>
      );

    case PropertyType.URL:
      return value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className={classes.link}>
          {value}
        </a>
      ) : (
        <input
          type="text"
          className={classes.cellInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
        />
      );

    case PropertyType.EMAIL:
      return value ? (
        <a href={`mailto:${value}`} className={classes.link}>
          {value}
        </a>
      ) : (
        <input
          type="email"
          className={classes.cellInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="email@..."
        />
      );

    case PropertyType.DATE:
      return (
        <input
          type="date"
          className={classes.cellInput}
          value={editValue || ""}
          onChange={(e) => {
            setEditValue(e.target.value);
            onUpdate(rowId, property.id, e.target.value);
          }}
        />
      );

    case PropertyType.NUMBER:
      return (
        <input
          type="number"
          className={classes.cellInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      );

    default:
      return (
        <input
          type="text"
          className={classes.cellInput}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={() => setIsEditing(true)}
        />
      );
  }
}

export default function DatabaseView(props: NodeViewProps) {
  const { node, editor, updateAttributes } = props;
  const { t } = useTranslation();
  const databaseId = node.attrs.databaseId;

  const [rowPeekState, setRowPeekState] = useAtom(rowPeekAtom);
  const [titleEdit, setTitleEdit] = useState("");

  const { data: database, isLoading: isLoadingDatabase } = useDatabaseQuery(databaseId);
  const { data: rowsData, isLoading: isLoadingRows } = useDatabaseRowsQuery(
    databaseId ? { databaseId, limit: 100 } : null
  );

  const createRowMutation = useCreateDatabaseRowMutation();
  const updateDatabaseMutation = useUpdateDatabaseMutation();
  const deleteDatabaseMutation = useDeleteDatabaseMutation();
  const addPropertyMutation = useAddPropertyMutation();
  const updateRowMutation = useUpdateDatabaseRowMutation();
  const deleteRowMutation = useDeleteDatabaseRowMutation();

  const rows = useMemo(() => {
    if (!rowsData?.pages) return [];
    return rowsData.pages.flatMap((page) => page.items);
  }, [rowsData]);

  const properties = useMemo(() => {
    if (!database?.properties) return [];
    return database.properties;
  }, [database]);

  useEffect(() => {
    if (database?.title) {
      setTitleEdit(database.title);
    }
  }, [database?.title]);

  const handleAddRow = useCallback(async () => {
    if (!databaseId) return;
    await createRowMutation.mutateAsync({ databaseId });
  }, [databaseId, createRowMutation]);

  const handleTitleBlur = useCallback(() => {
    if (databaseId && titleEdit !== database?.title) {
      updateDatabaseMutation.mutate({ databaseId, title: titleEdit });
    }
  }, [databaseId, titleEdit, database?.title, updateDatabaseMutation]);

  const handleAddProperty = useCallback(async (type: PropertyType) => {
    if (!databaseId) return;
    await addPropertyMutation.mutateAsync({
      databaseId,
      name: propertyTypeLabels[type],
      type,
    });
  }, [databaseId, addPropertyMutation]);

  const handleCellUpdate = useCallback(async (rowId: string, propertyId: string, value: any) => {
    const properties = JSON.stringify({ [propertyId]: value });
    await updateRowMutation.mutateAsync({ rowId, properties });
  }, [updateRowMutation]);

  const handleTitleUpdate = useCallback(async (rowId: string, title: string) => {
    await updateRowMutation.mutateAsync({ rowId, title });
  }, [updateRowMutation]);

  const handleRowClick = useCallback((row: IDatabaseRow) => {
    setRowPeekState({ isOpen: true, rowId: row.id, databaseId: row.databaseId });
  }, [setRowPeekState]);

  const handleDeleteRow = useCallback(async (rowId: string) => {
    if (!databaseId) return;
    await deleteRowMutation.mutateAsync({ rowId, databaseId });
  }, [databaseId, deleteRowMutation]);

  const handleDeleteDatabase = useCallback(async () => {
    if (!databaseId) return;
    await deleteDatabaseMutation.mutateAsync(databaseId);
    // Remove the node from the editor
    const pos = props.getPos();
    if (typeof pos === "number") {
      editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
    }
  }, [databaseId, deleteDatabaseMutation, editor, props, node]);

  if (!databaseId) {
    return (
      <NodeViewWrapper data-drag-handle>
        <div className={classes.container}>
          <div className={classes.emptyState}>
            <Text c="dimmed">{t("Database not found")}</Text>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  if (isLoadingDatabase) {
    return (
      <NodeViewWrapper data-drag-handle>
        <div className={classes.container}>
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper data-drag-handle>
      <div className={classes.container}>
        <div className={classes.header}>
          <IconDatabase size={18} style={{ color: "var(--mantine-color-gray-6)" }} />
          <input
            type="text"
            className={classes.titleInput}
            value={titleEdit}
            onChange={(e) => setTitleEdit(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder={t("Untitled Database")}
          />
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={handleDeleteDatabase}
              >
                {t("Delete database")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        <div className={classes.tableWrapper}>
          <table className={classes.table}>
            <thead className={classes.tableHeader}>
              <tr>
                <th className={classes.tableHeaderCell} style={{ width: 200 }}>
                  <IconFileDescription size={14} className={classes.propertyIcon} />
                  {t("Title")}
                </th>
                {properties.map((prop) => {
                  const Icon = propertyTypeIcons[prop.type] || IconTextSize;
                  return (
                    <th key={prop.id} className={classes.tableHeaderCell} style={{ width: prop.width || 150 }}>
                      <Icon size={14} className={classes.propertyIcon} />
                      {prop.name}
                    </th>
                  );
                })}
                <th className={classes.tableHeaderCell} style={{ width: 40 }}>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <Tooltip label={t("Add property")}>
                        <ActionIcon variant="subtle" color="gray" size="xs">
                          <IconPlus size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>{t("Property type")}</Menu.Label>
                      {Object.values(PropertyType).map((type) => {
                        const Icon = propertyTypeIcons[type];
                        return (
                          <Menu.Item
                            key={type}
                            leftSection={<Icon size={14} />}
                            onClick={() => handleAddProperty(type)}
                          >
                            {propertyTypeLabels[type]}
                          </Menu.Item>
                        );
                      })}
                    </Menu.Dropdown>
                  </Menu>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={classes.tableRow}>
                  <td
                    className={`${classes.tableCell} ${classes.titleCell}`}
                    onClick={() => handleRowClick(row)}
                  >
                    {row.icon && <span className={classes.rowIcon}>{row.icon}</span>}
                    {row.title || t("Untitled")}
                  </td>
                  {properties.map((prop) => (
                    <td key={prop.id} className={classes.tableCell}>
                      <TableCell
                        property={prop}
                        value={row.properties?.[prop.id]}
                        rowId={row.id}
                        databaseId={row.databaseId}
                        onUpdate={handleCellUpdate}
                      />
                    </td>
                  ))}
                  <td className={classes.tableCell}>
                    <Menu shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="xs">
                          <IconDots size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => handleDeleteRow(row.id)}
                        >
                          {t("Delete")}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className={classes.addRowButton}
          onClick={handleAddRow}
          disabled={createRowMutation.isPending}
        >
          <IconPlus size={14} />
          {t("New row")}
        </button>
      </div>

      <RowPeekDrawer />
    </NodeViewWrapper>
  );
}
