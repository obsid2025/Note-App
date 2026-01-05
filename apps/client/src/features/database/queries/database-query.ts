import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query";
import {
  createDatabase,
  getDatabaseById,
  updateDatabase,
  deleteDatabase,
  addProperty,
  updateProperty,
  deleteProperty,
  listDatabaseRows,
  createDatabaseRow,
  getDatabaseRowById,
  updateDatabaseRow,
  updateDatabaseRowContent,
  moveDatabaseRow,
  deleteDatabaseRow,
} from "../services/database-service";
import {
  IDatabase,
  IDatabaseRow,
  CreateDatabaseInput,
  UpdateDatabaseInput,
  AddPropertyInput,
  UpdatePropertyInput,
  DeletePropertyInput,
  CreateDatabaseRowInput,
  UpdateDatabaseRowInput,
  UpdateDatabaseRowContentInput,
  MoveDatabaseRowInput,
  ListDatabaseRowsParams,
} from "../types/database.types";
import { IPagination } from "@/lib/types";
import { notifications } from "@mantine/notifications";

// Database queries
export function useDatabaseQuery(databaseId: string | null): UseQueryResult<IDatabase, Error> {
  return useQuery({
    queryKey: ["database", databaseId],
    queryFn: () => getDatabaseById(databaseId!),
    enabled: !!databaseId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDatabaseMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabase, Error, CreateDatabaseInput>({
    mutationFn: (data) => createDatabase(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database", data.id], data);
    },
    onError: () => {
      notifications.show({ message: "Failed to create database", color: "red" });
    },
  });
}

export function useUpdateDatabaseMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabase, Error, UpdateDatabaseInput>({
    mutationFn: (data) => updateDatabase(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database", data.id], data);
    },
    onError: () => {
      notifications.show({ message: "Failed to update database", color: "red" });
    },
  });
}

export function useDeleteDatabaseMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (databaseId) => deleteDatabase(databaseId),
    onSuccess: (_, databaseId) => {
      queryClient.removeQueries({ queryKey: ["database", databaseId] });
      queryClient.removeQueries({ queryKey: ["database-rows", databaseId] });
      notifications.show({ message: "Database deleted" });
    },
    onError: () => {
      notifications.show({ message: "Failed to delete database", color: "red" });
    },
  });
}

// Property mutations
export function useAddPropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabase, Error, AddPropertyInput>({
    mutationFn: (data) => addProperty(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database", data.id], data);
    },
    onError: () => {
      notifications.show({ message: "Failed to add property", color: "red" });
    },
  });
}

export function useUpdatePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabase, Error, UpdatePropertyInput>({
    mutationFn: (data) => updateProperty(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database", data.id], data);
    },
    onError: () => {
      notifications.show({ message: "Failed to update property", color: "red" });
    },
  });
}

export function useDeletePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabase, Error, DeletePropertyInput>({
    mutationFn: (data) => deleteProperty(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database", data.id], data);
    },
    onError: () => {
      notifications.show({ message: "Failed to delete property", color: "red" });
    },
  });
}

// Row queries
export function useDatabaseRowsQuery(
  params: ListDatabaseRowsParams | null
): UseInfiniteQueryResult<InfiniteData<IPagination<IDatabaseRow>>, Error> {
  return useInfiniteQuery({
    queryKey: ["database-rows", params?.databaseId],
    queryFn: ({ pageParam }) => listDatabaseRows({ ...params!, page: pageParam }),
    enabled: !!params?.databaseId,
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) =>
      firstPage.meta.hasPrevPage ? firstPage.meta.page - 1 : undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useDatabaseRowQuery(rowId: string | null): UseQueryResult<IDatabaseRow, Error> {
  return useQuery({
    queryKey: ["database-row", rowId],
    queryFn: () => getDatabaseRowById(rowId!),
    enabled: !!rowId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDatabaseRowMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabaseRow, Error, CreateDatabaseRowInput>({
    mutationFn: (data) => createDatabaseRow(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["database-rows", data.databaseId] });
    },
    onError: () => {
      notifications.show({ message: "Failed to create row", color: "red" });
    },
  });
}

export function useUpdateDatabaseRowMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabaseRow, Error, UpdateDatabaseRowInput>({
    mutationFn: (data) => updateDatabaseRow(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database-row", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["database-rows", data.databaseId] });
    },
    onError: () => {
      notifications.show({ message: "Failed to update row", color: "red" });
    },
  });
}

export function useUpdateDatabaseRowContentMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabaseRow, Error, UpdateDatabaseRowContentInput>({
    mutationFn: (data) => updateDatabaseRowContent(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["database-row", data.id], data);
    },
    onError: () => {
      notifications.show({ message: "Failed to update row content", color: "red" });
    },
  });
}

export function useMoveDatabaseRowMutation() {
  const queryClient = useQueryClient();
  return useMutation<IDatabaseRow, Error, MoveDatabaseRowInput>({
    mutationFn: (data) => moveDatabaseRow(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["database-rows", data.databaseId] });
    },
    onError: () => {
      notifications.show({ message: "Failed to move row", color: "red" });
    },
  });
}

export function useDeleteDatabaseRowMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { rowId: string; databaseId: string }>({
    mutationFn: ({ rowId }) => deleteDatabaseRow(rowId),
    onSuccess: (_, { databaseId }) => {
      queryClient.invalidateQueries({ queryKey: ["database-rows", databaseId] });
      notifications.show({ message: "Row deleted" });
    },
    onError: () => {
      notifications.show({ message: "Failed to delete row", color: "red" });
    },
  });
}
