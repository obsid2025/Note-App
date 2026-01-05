import api from "@/lib/api-client";
import { IPagination } from "@/lib/types";
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

// Database operations
export async function createDatabase(data: CreateDatabaseInput): Promise<IDatabase> {
  const req = await api.post<IDatabase>("/databases/create", data);
  return req.data;
}

export async function getDatabaseById(databaseId: string): Promise<IDatabase> {
  const req = await api.post<IDatabase>("/databases/info", { databaseId });
  return req.data;
}

export async function updateDatabase(data: UpdateDatabaseInput): Promise<IDatabase> {
  const req = await api.post<IDatabase>("/databases/update", data);
  return req.data;
}

export async function deleteDatabase(databaseId: string): Promise<void> {
  await api.post("/databases/delete", { databaseId });
}

// Property operations
export async function addProperty(data: AddPropertyInput): Promise<IDatabase> {
  const req = await api.post<IDatabase>("/databases/property/add", data);
  return req.data;
}

export async function updateProperty(data: UpdatePropertyInput): Promise<IDatabase> {
  const req = await api.post<IDatabase>("/databases/property/update", data);
  return req.data;
}

export async function deleteProperty(data: DeletePropertyInput): Promise<IDatabase> {
  const req = await api.post<IDatabase>("/databases/property/delete", data);
  return req.data;
}

// Row operations
export async function listDatabaseRows(data: ListDatabaseRowsParams): Promise<IPagination<IDatabaseRow>> {
  const req = await api.post<IPagination<IDatabaseRow>>("/database-rows/list", data);
  return req.data;
}

export async function createDatabaseRow(data: CreateDatabaseRowInput): Promise<IDatabaseRow> {
  const req = await api.post<IDatabaseRow>("/database-rows/create", data);
  return req.data;
}

export async function getDatabaseRowById(rowId: string): Promise<IDatabaseRow> {
  const req = await api.post<IDatabaseRow>("/database-rows/info", { rowId });
  return req.data;
}

export async function updateDatabaseRow(data: UpdateDatabaseRowInput): Promise<IDatabaseRow> {
  const req = await api.post<IDatabaseRow>("/database-rows/update", data);
  return req.data;
}

export async function updateDatabaseRowContent(data: UpdateDatabaseRowContentInput): Promise<IDatabaseRow> {
  const req = await api.post<IDatabaseRow>("/database-rows/update-content", data);
  return req.data;
}

export async function moveDatabaseRow(data: MoveDatabaseRowInput): Promise<IDatabaseRow> {
  const req = await api.post<IDatabaseRow>("/database-rows/move", data);
  return req.data;
}

export async function deleteDatabaseRow(rowId: string): Promise<void> {
  await api.post("/database-rows/delete", { rowId });
}
