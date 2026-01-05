import { Module } from '@nestjs/common';
import { DatabaseController, DatabaseRowController } from './database.controller';
import { DatabaseService } from './services/database.service';
import { DatabaseRowService } from './services/database-row.service';
import { DatabaseRepo } from '@docmost/db/repos/database/database.repo';
import { DatabaseRowRepo } from '@docmost/db/repos/database/database-row.repo';
import { PageRepo } from '@docmost/db/repos/page/page.repo';

@Module({
  controllers: [DatabaseController, DatabaseRowController],
  providers: [
    DatabaseService,
    DatabaseRowService,
    DatabaseRepo,
    DatabaseRowRepo,
    PageRepo,
  ],
  exports: [DatabaseService, DatabaseRowService],
})
export class DatabaseModule {}
