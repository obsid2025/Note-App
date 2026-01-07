import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Fragment } from "@tiptap/pm/model";

export interface ColumnDropOptions {
  /**
   * The width of the edge zone (in pixels) that triggers horizontal drop
   */
  edgeWidth: number;
}

const columnDropPluginKey = new PluginKey("columnDrop");

export const ColumnDrop = Extension.create<ColumnDropOptions>({
  name: "columnDrop",

  addOptions() {
    return {
      edgeWidth: 50,
    };
  },

  addProseMirrorPlugins() {
    const edgeWidth = this.options.edgeWidth;

    return [
      new Plugin({
        key: columnDropPluginKey,
        state: {
          init() {
            return {
              dropSide: null as "left" | "right" | null,
              targetPos: null as number | null,
              decorations: DecorationSet.empty,
            };
          },
          apply(tr, value) {
            const meta = tr.getMeta(columnDropPluginKey);
            if (meta) {
              if (meta.clear) {
                return {
                  dropSide: null,
                  targetPos: null,
                  decorations: DecorationSet.empty,
                };
              }
              if (meta.dropSide !== undefined) {
                return {
                  dropSide: meta.dropSide,
                  targetPos: meta.targetPos,
                  decorations: meta.decorations || DecorationSet.empty,
                };
              }
            }
            return {
              ...value,
              decorations: value.decorations.map(tr.mapping, tr.doc),
            };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations || DecorationSet.empty;
          },
          handleDOMEvents: {
            dragover: (view, event) => {
              if (!view.dragging) return false;

              const coords = { left: event.clientX, top: event.clientY };
              const pos = view.posAtCoords(coords);
              if (!pos) return false;

              const $pos = view.state.doc.resolve(pos.pos);

              // Find the closest block-level node
              let depth = $pos.depth;
              while (depth > 0) {
                const node = $pos.node(depth);
                if (node.isBlock && !node.isTextblock) {
                  break;
                }
                depth--;
              }

              if (depth === 0) {
                // Clear any existing decorations
                view.dispatch(
                  view.state.tr.setMeta(columnDropPluginKey, { clear: true })
                );
                return false;
              }

              const nodeStart = $pos.before(depth);
              const nodeEnd = $pos.after(depth);
              const nodeDOM = view.nodeDOM(nodeStart);

              if (!(nodeDOM instanceof HTMLElement)) {
                return false;
              }

              const rect = nodeDOM.getBoundingClientRect();
              const relativeX = event.clientX - rect.left;
              const nodeWidth = rect.width;

              // Check if we're in the left or right edge zone
              let dropSide: "left" | "right" | null = null;

              if (relativeX < edgeWidth) {
                dropSide = "left";
              } else if (relativeX > nodeWidth - edgeWidth) {
                dropSide = "right";
              }

              // Don't show column drop if target is already a column or inside columns
              const targetNode = $pos.node(depth);
              if (
                targetNode.type.name === "column" ||
                targetNode.type.name === "columns"
              ) {
                dropSide = null;
              }

              // Check parent nodes
              for (let d = depth - 1; d > 0; d--) {
                const parent = $pos.node(d);
                if (parent.type.name === "columns") {
                  dropSide = null;
                  break;
                }
              }

              if (dropSide) {
                event.preventDefault();
                event.stopPropagation();

                // Create decoration for visual feedback
                const decorationClass =
                  dropSide === "left"
                    ? "column-drop-indicator-left"
                    : "column-drop-indicator-right";

                const decoration = Decoration.node(nodeStart, nodeEnd, {
                  class: decorationClass,
                });

                const decorations = DecorationSet.create(view.state.doc, [
                  decoration,
                ]);

                view.dispatch(
                  view.state.tr.setMeta(columnDropPluginKey, {
                    dropSide,
                    targetPos: nodeStart,
                    decorations,
                  })
                );

                return true;
              } else {
                // Clear decorations if not in edge zone
                const state = columnDropPluginKey.getState(view.state);
                if (state?.dropSide) {
                  view.dispatch(
                    view.state.tr.setMeta(columnDropPluginKey, { clear: true })
                  );
                }
              }

              return false;
            },

            dragleave: (view) => {
              view.dispatch(
                view.state.tr.setMeta(columnDropPluginKey, { clear: true })
              );
              return false;
            },

            drop: (view, event) => {
              const state = columnDropPluginKey.getState(view.state);

              if (!state?.dropSide || state.targetPos === null) {
                return false;
              }

              event.preventDefault();
              event.stopPropagation();

              const { dropSide, targetPos } = state;

              // Clear decorations first
              view.dispatch(
                view.state.tr.setMeta(columnDropPluginKey, { clear: true })
              );

              // Get the dragged content
              if (!view.dragging) return false;

              const draggedSlice = view.dragging.slice;
              if (!draggedSlice.content.childCount) return false;

              const draggedNode = draggedSlice.content.firstChild;
              if (!draggedNode) return false;

              // Get the target node
              const $targetPos = view.state.doc.resolve(targetPos);
              let targetDepth = $targetPos.depth;

              // Find the block-level target
              while (targetDepth > 0) {
                const node = $targetPos.node(targetDepth);
                if (node.isBlock && !node.isTextblock) {
                  break;
                }
                targetDepth--;
              }

              if (targetDepth === 0) return false;

              const targetStart = $targetPos.before(targetDepth);
              const targetEnd = $targetPos.after(targetDepth);
              const targetNode = view.state.doc.nodeAt(targetStart);

              if (!targetNode) return false;

              // Get the source position from the selection
              const { from: dragFrom } = view.state.selection;
              const $dragFrom = view.state.doc.resolve(dragFrom);

              // Find the dragged block
              let dragDepth = $dragFrom.depth;
              while (dragDepth > 0) {
                const node = $dragFrom.node(dragDepth);
                if (node.isBlock && !node.isTextblock) {
                  break;
                }
                dragDepth--;
              }

              if (dragDepth === 0) return false;

              const dragStart = $dragFrom.before(dragDepth);
              const dragEnd = $dragFrom.after(dragDepth);
              const dragNode = view.state.doc.nodeAt(dragStart);

              if (!dragNode) return false;

              // Don't allow dropping on itself
              if (dragStart === targetStart) return false;

              // Create the columns structure
              const schema = view.state.schema;
              const columnsType = schema.nodes.columns;
              const columnType = schema.nodes.column;

              if (!columnsType || !columnType) {
                console.error("Columns or Column node type not found");
                return false;
              }

              // Determine which node goes in which column based on drop side
              const leftNode = dropSide === "left" ? dragNode : targetNode;
              const rightNode = dropSide === "left" ? targetNode : dragNode;

              // Create columns with the two blocks - each column contains the full node
              const leftColumn = columnType.create(
                null,
                Fragment.from(leftNode.copy(leftNode.content))
              );
              const rightColumn = columnType.create(
                null,
                Fragment.from(rightNode.copy(rightNode.content))
              );

              const columnsNode = columnsType.create(
                null,
                Fragment.from([leftColumn, rightColumn])
              );

              // Calculate positions for replacement
              // We need to handle the case where dragStart < targetStart or dragStart > targetStart
              let tr = view.state.tr;

              if (dragStart < targetStart) {
                // Delete the dragged block first (lower position), then replace target
                const adjustedTargetStart = targetStart - (dragEnd - dragStart);
                const adjustedTargetEnd = targetEnd - (dragEnd - dragStart);

                tr = tr.delete(dragStart, dragEnd);
                tr = tr.replaceWith(adjustedTargetStart, adjustedTargetEnd, columnsNode);
              } else {
                // Replace target first, then delete the dragged block
                tr = tr.replaceWith(targetStart, targetEnd, columnsNode);
                const adjustedDragStart = dragStart + (columnsNode.nodeSize - (targetEnd - targetStart));
                const adjustedDragEnd = dragEnd + (columnsNode.nodeSize - (targetEnd - targetStart));

                tr = tr.delete(adjustedDragStart, adjustedDragEnd);
              }

              view.dispatch(tr);
              return true;
            },
          },
        },
      }),
    ];
  },
});
