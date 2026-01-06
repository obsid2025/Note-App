export enum PropertyType {
  TITLE = 'title',
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  URL = 'url',
  EMAIL = 'email',
  PERSON = 'person',
  FILES = 'files',
  FORMULA = 'formula',
  RELATION = 'relation',
}

export enum DateFilterType {
  ALL = 'all',
  LAST_7_DAYS = 'last_7_days',
  CURRENT_MONTH = 'current_month',
}

export interface PropertyOption {
  id: string;
  value: string;
  color?: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  width?: number;
  options?: PropertyOption[];
}

export interface IDatabase {
  id: string;
  slugId: string;
  title: string;
  icon?: string;
  properties: PropertyDefinition[];
  viewConfig?: Record<string, any>;
  pageId: string;
  spaceId: string;
  workspaceId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDatabaseRow {
  id: string;
  slugId: string;
  position: string;
  title?: string;
  icon?: string;
  properties: Record<string, any>;
  content?: any;
  databaseId: string;
  spaceId: string;
  workspaceId: string;
  creatorId: string;
  lastUpdatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDatabaseInput {
  pageId: string;
  spaceId: string;
  title?: string;
  icon?: string;
}

export interface UpdateDatabaseInput {
  databaseId: string;
  title?: string;
  icon?: string;
  viewConfig?: string;
}

export interface AddPropertyInput {
  databaseId: string;
  name: string;
  type: PropertyType;
  options?: string;
}

export interface UpdatePropertyInput {
  databaseId: string;
  propertyId: string;
  name?: string;
  type?: PropertyType;
  width?: number;
  options?: string;
}

export interface DeletePropertyInput {
  databaseId: string;
  propertyId: string;
}

export interface CreateDatabaseRowInput {
  databaseId: string;
  title?: string;
  icon?: string;
  properties?: string;
}

export interface UpdateDatabaseRowInput {
  rowId: string;
  title?: string;
  icon?: string;
  properties?: string;
}

export interface UpdateDatabaseRowContentInput {
  rowId: string;
  content: string;
}

export interface MoveDatabaseRowInput {
  rowId: string;
  afterRowId?: string;
  beforeRowId?: string;
}

export interface ListDatabaseRowsParams {
  databaseId: string;
  page?: number;
  limit?: number;
}
