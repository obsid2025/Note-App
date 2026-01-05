import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { DatabaseRowService } from './services/database-row.service';
import {
  CreateDatabaseDto,
  UpdateDatabaseDto,
  AddPropertyDto,
  UpdatePropertyDto,
  DeletePropertyDto,
  CreateDatabaseRowDto,
  UpdateDatabaseRowDto,
  UpdateDatabaseRowContentDto,
  MoveDatabaseRowDto,
  DatabaseIdDto,
  DatabaseRowIdDto,
  ListDatabaseRowsDto,
} from './dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { AuthWorkspace } from '../../common/decorators/auth-workspace.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, Workspace } from '@docmost/db/types/entity.types';
import SpaceAbilityFactory from '../casl/abilities/space-ability.factory';
import { PageRepo } from '@docmost/db/repos/page/page.repo';
import { DatabaseRepo } from '@docmost/db/repos/database/database.repo';
import {
  SpaceCaslAction,
  SpaceCaslSubject,
} from '../casl/interfaces/space-ability.type';

@UseGuards(JwtAuthGuard)
@Controller('databases')
export class DatabaseController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly databaseRowService: DatabaseRowService,
    private readonly databaseRepo: DatabaseRepo,
    private readonly pageRepo: PageRepo,
    private readonly spaceAbility: SpaceAbilityFactory,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('create')
  async create(
    @Body() dto: CreateDatabaseDto,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const page = await this.pageRepo.findById(dto.pageId);
    if (!page || page.deletedAt) {
      throw new NotFoundException('Page not found');
    }

    const ability = await this.spaceAbility.createForUser(user, page.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseService.create(user.id, workspace.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('info')
  async findOne(@Body() input: DatabaseIdDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(input.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return database;
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async update(@Body() dto: UpdateDatabaseDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseService.update(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async delete(@Body() input: DatabaseIdDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(input.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    await this.databaseService.delete(input.databaseId);
  }

  // Property management endpoints
  @HttpCode(HttpStatus.OK)
  @Post('property/add')
  async addProperty(@Body() dto: AddPropertyDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseService.addProperty(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('property/update')
  async updateProperty(@Body() dto: UpdatePropertyDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseService.updateProperty(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('property/delete')
  async deleteProperty(@Body() dto: DeletePropertyDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseService.deleteProperty(dto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('database-rows')
export class DatabaseRowController {
  constructor(
    private readonly databaseRowService: DatabaseRowService,
    private readonly databaseRepo: DatabaseRepo,
    private readonly spaceAbility: SpaceAbilityFactory,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async list(@Body() dto: ListDatabaseRowsDto, @AuthUser() user: User) {
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseRowService.list(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('create')
  async create(
    @Body() dto: CreateDatabaseRowDto,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const database = await this.databaseRepo.findById(dto.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseRowService.create(user.id, workspace.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('info')
  async findOne(@Body() input: DatabaseRowIdDto, @AuthUser() user: User) {
    const row = await this.databaseRowService.findById(input.rowId, true);

    const database = await this.databaseRepo.findById(row.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Read, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return row;
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async update(@Body() dto: UpdateDatabaseRowDto, @AuthUser() user: User) {
    const row = await this.databaseRowService.findById(dto.rowId);

    const database = await this.databaseRepo.findById(row.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseRowService.update(user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('update-content')
  async updateContent(
    @Body() dto: UpdateDatabaseRowContentDto,
    @AuthUser() user: User,
  ) {
    const row = await this.databaseRowService.findById(dto.rowId);

    const database = await this.databaseRepo.findById(row.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseRowService.updateContent(user.id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('move')
  async move(@Body() dto: MoveDatabaseRowDto, @AuthUser() user: User) {
    const row = await this.databaseRowService.findById(dto.rowId);

    const database = await this.databaseRepo.findById(row.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    return this.databaseRowService.move(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async delete(@Body() input: DatabaseRowIdDto, @AuthUser() user: User) {
    const row = await this.databaseRowService.findById(input.rowId);

    const database = await this.databaseRepo.findById(row.databaseId);
    if (!database) {
      throw new NotFoundException('Database not found');
    }

    const ability = await this.spaceAbility.createForUser(user, database.spaceId);
    if (ability.cannot(SpaceCaslAction.Edit, SpaceCaslSubject.Page)) {
      throw new ForbiddenException();
    }

    await this.databaseRowService.delete(input.rowId);
  }
}
