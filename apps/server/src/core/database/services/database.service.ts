import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB } from '@docmost/db/types/kysely.types';
import { DatabaseRepo } from '@docmost/db/repos/database/database.repo';
import { Database } from '@docmost/db/types/entity.types';
import { generateSlugId } from '../../../common/helpers';
import { CreateDatabaseDto, UpdateDatabaseDto, AddPropertyDto, UpdatePropertyDto, DeletePropertyDto } from '../dto';
import { PropertyDefinition, PropertyType } from '../types/property-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectKysely() private readonly db: KyselyDB,
    private readonly databaseRepo: DatabaseRepo,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateDatabaseDto,
  ): Promise<Database> {
    // Create default title property
    const defaultProperties: PropertyDefinition[] = [
      {
        id: uuidv4(),
        name: 'Title',
        type: PropertyType.TEXT,
      },
    ];

    const database = await this.databaseRepo.insertDatabase({
      slugId: generateSlugId(),
      title: dto.title || 'Untitled Database',
      icon: dto.icon,
      properties: JSON.stringify(defaultProperties),
      pageId: dto.pageId,
      spaceId: dto.spaceId,
      workspaceId,
      creatorId: userId,
    });

    return database;
  }

  async findById(databaseId: string): Promise<Database> {
    const database = await this.databaseRepo.findById(databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }
    return database;
  }

  async findBySlugId(slugId: string): Promise<Database> {
    const database = await this.databaseRepo.findBySlugId(slugId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }
    return database;
  }

  async update(dto: UpdateDatabaseDto): Promise<Database> {
    const database = await this.findById(dto.databaseId);

    await this.databaseRepo.updateDatabase(
      {
        title: dto.title ?? database.title,
        icon: dto.icon ?? database.icon,
        viewConfig: dto.viewConfig ? JSON.parse(dto.viewConfig) : database.viewConfig,
      },
      dto.databaseId,
    );

    return this.findById(dto.databaseId);
  }

  async delete(databaseId: string): Promise<void> {
    await this.findById(databaseId);
    await this.databaseRepo.deleteDatabase(databaseId);
  }

  async addProperty(dto: AddPropertyDto): Promise<Database> {
    const database = await this.findById(dto.databaseId);
    const properties = this.parseProperties(database.properties);

    const newProperty: PropertyDefinition = {
      id: uuidv4(),
      name: dto.name,
      type: dto.type,
      options: dto.options ? JSON.parse(dto.options) : undefined,
    };

    properties.push(newProperty);

    await this.databaseRepo.updateDatabase(
      { properties: JSON.stringify(properties) },
      dto.databaseId,
    );

    return this.findById(dto.databaseId);
  }

  async updateProperty(dto: UpdatePropertyDto): Promise<Database> {
    const database = await this.findById(dto.databaseId);
    const properties = this.parseProperties(database.properties);

    const propertyIndex = properties.findIndex((p) => p.id === dto.propertyId);
    if (propertyIndex === -1) {
      throw new NotFoundException('Property not found');
    }

    const property = properties[propertyIndex];
    properties[propertyIndex] = {
      ...property,
      name: dto.name ?? property.name,
      type: dto.type ?? property.type,
      width: dto.width ?? property.width,
      options: dto.options ? JSON.parse(dto.options) : property.options,
    };

    await this.databaseRepo.updateDatabase(
      { properties: JSON.stringify(properties) },
      dto.databaseId,
    );

    return this.findById(dto.databaseId);
  }

  async deleteProperty(dto: DeletePropertyDto): Promise<Database> {
    const database = await this.findById(dto.databaseId);
    const properties = this.parseProperties(database.properties);

    const filteredProperties = properties.filter((p) => p.id !== dto.propertyId);

    if (filteredProperties.length === properties.length) {
      throw new NotFoundException('Property not found');
    }

    // Don't allow deleting the last property
    if (filteredProperties.length === 0) {
      throw new BadRequestException('Cannot delete the last property');
    }

    await this.databaseRepo.updateDatabase(
      { properties: JSON.stringify(filteredProperties) },
      dto.databaseId,
    );

    return this.findById(dto.databaseId);
  }

  private parseProperties(properties: any): PropertyDefinition[] {
    if (!properties) return [];
    if (typeof properties === 'string') {
      return JSON.parse(properties);
    }
    return properties as PropertyDefinition[];
  }
}
