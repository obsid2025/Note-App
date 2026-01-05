import { IsOptional, IsString, IsUUID, IsJSON } from 'class-validator';

export class CreateDatabaseRowDto {
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
  properties?: string;
}
