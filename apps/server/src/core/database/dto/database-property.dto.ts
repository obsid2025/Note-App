import { IsOptional, IsString, IsUUID, IsEnum, IsJSON, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../types/property-types';

export class AddPropertyDto {
  @IsUUID()
  databaseId: string;

  @IsString()
  name: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsOptional()
  @IsJSON()
  options?: string;
}

export class UpdatePropertyDto {
  @IsUUID()
  databaseId: string;

  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @IsJSON()
  options?: string;

  @IsOptional()
  width?: number;
}

export class DeletePropertyDto {
  @IsUUID()
  databaseId: string;

  @IsString()
  propertyId: string;
}

export class ReorderPropertiesDto {
  @IsUUID()
  databaseId: string;

  @IsString({ each: true })
  propertyIds: string[];
}
