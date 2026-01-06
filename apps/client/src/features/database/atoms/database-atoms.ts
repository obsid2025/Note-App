import { atom } from "jotai";

export interface RowPeekState {
  isOpen: boolean;
  rowId: string | null;
  databaseId: string | null;
  droppedContent?: string | null; // HTML content dropped from external source
}

export const rowPeekAtom = atom<RowPeekState>({
  isOpen: false,
  rowId: null,
  databaseId: null,
  droppedContent: null,
});

export const openRowPeek = atom(
  null,
  (get, set, { rowId, databaseId }: { rowId: string; databaseId: string }) => {
    set(rowPeekAtom, { isOpen: true, rowId, databaseId, droppedContent: null });
  }
);

export const closeRowPeek = atom(null, (get, set) => {
  set(rowPeekAtom, { isOpen: false, rowId: null, databaseId: null, droppedContent: null });
});

// Atom for dropped content to be inserted into row
export const droppedContentAtom = atom<string | null>(null);
