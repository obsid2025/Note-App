import { IsOptional, IsString, IsUUID, IsJSON } from 'class-validator';

export class UpdateDatabaseDto {
  @IsUUID()
  databaseId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsJSON()
  viewConfig?: string;
}
