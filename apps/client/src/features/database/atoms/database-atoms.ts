import { atom } from "jotai";

export interface RowPeekState {
  isOpen: boolean;
  rowId: string | null;
  databaseId: string | null;
}

export const rowPeekAtom = atom<RowPeekState>({
  isOpen: false,
  rowId: null,
  databaseId: null,
});

export const openRowPeek = atom(
  null,
  (get, set, { rowId, databaseId }: { rowId: string; databaseId: string }) => {
    set(rowPeekAtom, { isOpen: true, rowId, databaseId });
  }
);

export const closeRowPeek = atom(null, (get, set) => {
  set(rowPeekAtom, { isOpen: false, rowId: null, databaseId: null });
});
