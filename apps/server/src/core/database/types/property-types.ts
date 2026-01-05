export enum PropertyType {
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

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface PropertyOptions {
  // For SELECT and MULTI_SELECT
  options?: SelectOption[];

  // For NUMBER
  format?: 'number' | 'percent' | 'currency';

  // For DATE
  includeTime?: boolean;
  dateFormat?: string;

  // For FORMULA
  formula?: string;

  // For RELATION
  relatedDatabaseId?: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  width?: number;
  options?: PropertyOptions;
}

// Property value types
export type PropertyValue =
  | string // TEXT, URL, EMAIL
  | number // NUMBER
  | boolean // CHECKBOX
  | string[] // MULTI_SELECT (array of option IDs)
  | string // SELECT (single option ID)
  | Date | string // DATE
  | string[] // PERSON (array of user IDs)
  | string[] // FILES (array of attachment IDs)
  | null;

export interface RowProperties {
  [propertyId: string]: PropertyValue;
}

// View configuration
export interface ViewConfig {
  sorting?: {
    propertyId: string;
    direction: 'asc' | 'desc';
  }[];
  filters?: {
    propertyId: string;
    operator: string;
    value: PropertyValue;
  }[];
  hiddenProperties?: string[];
  propertyOrder?: string[];
}

// Default colors for select options
export const SELECT_COLORS = [
  'gray',
  'brown',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'red',
] as const;
