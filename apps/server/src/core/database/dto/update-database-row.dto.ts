import { IsOptional, IsString, IsUUID, IsJSON } from 'class-validator';

export class UpdateDatabaseRowDto {
  @IsUUID()
  rowId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsJSON()
  properties?: string;
}

export class UpdateDatabaseRowContentDto {
  @IsUUID()
  rowId: string;

  @IsOptional()
  @IsJSON()
  content?: string;
}

export class MoveDatabaseRowDto {
  @IsUUID()
  rowId: string;

  @IsOptional()
  @IsString()
  afterRowId?: string;

  @IsOptional()
  @IsString()
  beforeRowId?: string;
}
