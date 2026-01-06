import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB } from '@docmost/db/types/kysely.types';
import { DatabaseRowRepo } from '@docmost/db/repos/database/database-row.repo';
import { DatabaseRepo } from '@docmost/db/repos/database/database.repo';
import { DatabaseRow } from '@docmost/db/types/entity.types';
import { generateSlugId } from '../../../common/helpers';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import {
  CreateDatabaseRowDto,
  UpdateDatabaseRowDto,
  UpdateDatabaseRowContentDto,
  MoveDatabaseRowDto,
  ListDatabaseRowsDto,
} from '../dto';
import { PaginationResult } from '@docmost/db/pagination/pagination';
import { PaginationOptions } from '@docmost/db/pagination/pagination-options';

@Injectable()
export class DatabaseRowService {
  constructor(
    @InjectKysely() private readonly db: KyselyDB,
    private readonly databaseRowRepo: DatabaseRowRepo,
    private readonly databaseRepo: DatabaseRepo,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateDatabaseRowDto,
  ): Promise<DatabaseRow> {
    // Verify database exists
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    // Get position for new row
    const lastPosition = await this.databaseRowRepo.getLastRowPosition(dto.databaseId);
    const position = generateJitteredKeyBetween(lastPosition, null);

    // Parse existing properties from DTO
    let properties = dto.properties ? JSON.parse(dto.properties) : {};

    // Auto-set date properties (like "Created") to current date
    const dbProperties = this.parseProperties(database.properties);
    for (const prop of dbProperties) {
      if (prop.type === 'date' && prop.name.toLowerCase() === 'created' && !properties[prop.id]) {
        properties[prop.id] = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    }

    const row = await this.databaseRowRepo.insertRow({
      slugId: generateSlugId(),
      position,
      title: dto.title,
      icon: dto.icon,
      properties,
      databaseId: dto.databaseId,
      spaceId: database.spaceId,
      workspaceId,
      creatorId: userId,
    });

    return row;
  }

  private parseProperties(properties: any): any[] {
    if (!properties) return [];
    if (typeof properties === 'string') {
      return JSON.parse(properties);
    }
    return properties;
  }

  async findById(rowId: string, includeContent = false): Promise<DatabaseRow> {
    const row = await this.databaseRowRepo.findById(rowId, { includeContent });
    if (!row) {
      throw new NotFoundException('Database row not found');
    }
    return row;
  }

  async findBySlugId(slugId: string, includeContent = false): Promise<DatabaseRow> {
    const row = await this.databaseRowRepo.findBySlugId(slugId, { includeContent });
    if (!row) {
      throw new NotFoundException('Database row not found');
    }
    return row;
  }

  async list(dto: ListDatabaseRowsDto): Promise<PaginationResult<Partial<DatabaseRow>>> {
    const pagination = new PaginationOptions();
    pagination.page = dto.page || 1;
    pagination.limit = dto.limit || 50;

    return this.databaseRowRepo.findByDatabaseId(dto.databaseId, pagination);
  }

  async update(userId: string, dto: UpdateDatabaseRowDto): Promise<DatabaseRow> {
    const row = await this.findById(dto.rowId);

    const updateData: any = {
      lastUpdatedById: userId,
    };

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (dto.icon !== undefined) {
      updateData.icon = dto.icon;
    }

    if (dto.properties !== undefined) {
      // Merge with existing properties
      const existingProperties =
        row.properties && typeof row.properties === 'object' && !Array.isArray(row.properties)
          ? row.properties
          : {};
      const newProperties = JSON.parse(dto.properties);
      updateData.properties = { ...existingProperties, ...newProperties };
    }

    await this.databaseRowRepo.updateRow(updateData, dto.rowId);

    return this.findById(dto.rowId);
  }

  async updateContent(userId: string, dto: UpdateDatabaseRowContentDto): Promise<DatabaseRow> {
    await this.findById(dto.rowId);

    await this.databaseRowRepo.updateRow(
      {
        content: dto.content ? JSON.parse(dto.content) : null,
        lastUpdatedById: userId,
      },
      dto.rowId,
    );

    return this.findById(dto.rowId, true);
  }

  async move(dto: MoveDatabaseRowDto): Promise<DatabaseRow> {
    const row = await this.findById(dto.rowId);

    let newPosition: string;

    if (dto.afterRowId) {
      const afterRow = await this.findById(dto.afterRowId);
      // Position after the specified row
      newPosition = generateJitteredKeyBetween(afterRow.position, null);
    } else if (dto.beforeRowId) {
      const beforeRow = await this.findById(dto.beforeRowId);
      // Position before the specified row
      newPosition = generateJitteredKeyBetween(null, beforeRow.position);
    } else {
      // Move to the beginning
      newPosition = generateJitteredKeyBetween(null, null);
    }

    await this.databaseRowRepo.updateRow({ position: newPosition }, dto.rowId);

    return this.findById(dto.rowId);
  }

  async delete(rowId: string): Promise<void> {
    await this.findById(rowId);
    await this.databaseRowRepo.deleteRow(rowId);
  }

  async countRows(databaseId: string): Promise<number> {
    return this.databaseRowRepo.countRows(databaseId);
  }
}
