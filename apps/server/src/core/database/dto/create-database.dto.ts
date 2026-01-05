import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDatabaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsUUID()
  pageId: string;

  @IsUUID()
  spaceId: string;
}
