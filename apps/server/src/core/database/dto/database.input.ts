import { IsOptional, IsString, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class DatabaseIdDto {
  @IsString()
  databaseId: string;
}

export class DatabaseRowIdDto {
  @IsString()
  rowId: string;
}

export class ListDatabaseRowsDto {
  @IsUUID()
  databaseId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
