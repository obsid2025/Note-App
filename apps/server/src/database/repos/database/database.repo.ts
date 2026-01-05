import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB, KyselyTransaction } from '../../types/kysely.types';
import { dbOrTx } from '../../utils';
import {
  Database,
  InsertableDatabase,
  UpdatableDatabase,
} from '@docmost/db/types/entity.types';
import { ExpressionBuilder } from 'kysely';
import { DbInterface } from '@docmost/db/types/db.interface';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

@Injectable()
export class DatabaseRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async findById(
    databaseId: string,
    opts?: { includeCreator?: boolean },
  ): Promise<Database | undefined> {
    const result = await this.db
      .selectFrom('databases')
      .selectAll()
      .$if(opts?.includeCreator === true, (qb) => qb.select(this.withCreator))
      .where('id', '=', databaseId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
    return result as Database | undefined;
  }

  async findBySlugId(
    slugId: string,
    opts?: { includeCreator?: boolean },
  ): Promise<Database | undefined> {
    const result = await this.db
      .selectFrom('databases')
      .selectAll()
      .$if(opts?.includeCreator === true, (qb) => qb.select(this.withCreator))
      .where('slugId', '=', slugId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
    return result as Database | undefined;
  }

  async findByPageId(
    pageId: string,
    workspaceId: string,
  ): Promise<Database[]> {
    const result = await this.db
      .selectFrom('databases')
      .selectAll()
      .where('pageId', '=', pageId)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .execute();
    return result as Database[];
  }

  async insertDatabase(
    insertableDatabase: InsertableDatabase,
    trx?: KyselyTransaction,
  ): Promise<Database> {
    const db = dbOrTx(this.db, trx);
    const result = await db
      .insertInto('databases')
      .values(insertableDatabase)
      .returningAll()
      .executeTakeFirst();
    return result as Database;
  }

  async updateDatabase(
    updatableDatabase: UpdatableDatabase,
    databaseId: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('databases')
      .set({
        ...updatableDatabase,
        updatedAt: new Date(),
      })
      .where('id', '=', databaseId)
      .execute();
  }

  async deleteDatabase(databaseId: string, trx?: KyselyTransaction): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('databases')
      .set({ deletedAt: new Date() })
      .where('id', '=', databaseId)
      .execute();
  }

  async permanentlyDeleteDatabase(databaseId: string, trx?: KyselyTransaction): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .deleteFrom('databases')
      .where('id', '=', databaseId)
      .execute();
  }

  withCreator(eb: ExpressionBuilder<DbInterface, 'databases'>) {
    return jsonObjectFrom(
      eb
        .selectFrom('users')
        .select(['users.id', 'users.name', 'users.avatarUrl'])
        .whereRef('users.id', '=', 'databases.creatorId'),
    ).as('creator');
  }
}
