import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB, KyselyTransaction } from '../../types/kysely.types';
import { dbOrTx } from '../../utils';
import {
  DatabaseRow,
  InsertableDatabaseRow,
  UpdatableDatabaseRow,
} from '@docmost/db/types/entity.types';
import { PaginationOptions } from '@docmost/db/pagination/pagination-options';
import { executeWithPagination } from '@docmost/db/pagination/pagination';
import { ExpressionBuilder } from 'kysely';
import { DbInterface } from '@docmost/db/types/db.interface';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

@Injectable()
export class DatabaseRowRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  private baseFields = [
    'databaseRows.id',
    'databaseRows.slugId',
    'databaseRows.position',
    'databaseRows.properties',
    'databaseRows.title',
    'databaseRows.icon',
    'databaseRows.databaseId',
    'databaseRows.spaceId',
    'databaseRows.workspaceId',
    'databaseRows.creatorId',
    'databaseRows.lastUpdatedById',
    'databaseRows.createdAt',
    'databaseRows.updatedAt',
    'databaseRows.deletedAt',
  ] as const;

  async findById(
    rowId: string,
    opts?: { includeCreator?: boolean; includeContent?: boolean },
  ): Promise<DatabaseRow | undefined> {
    const result = await this.db
      .selectFrom('databaseRows')
      .select(this.baseFields)
      .$if(opts?.includeContent === true, (qb) =>
        qb.select(['databaseRows.content', 'databaseRows.ydoc', 'databaseRows.textContent']),
      )
      .$if(opts?.includeCreator === true, (qb) => qb.select(this.withCreator))
      .where('id', '=', rowId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    return result as DatabaseRow | undefined;
  }

  async findBySlugId(
    slugId: string,
    opts?: { includeCreator?: boolean; includeContent?: boolean },
  ): Promise<DatabaseRow | undefined> {
    const result = await this.db
      .selectFrom('databaseRows')
      .select(this.baseFields)
      .$if(opts?.includeContent === true, (qb) =>
        qb.select(['databaseRows.content', 'databaseRows.ydoc', 'databaseRows.textContent']),
      )
      .$if(opts?.includeCreator === true, (qb) => qb.select(this.withCreator))
      .where('slugId', '=', slugId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    return result as DatabaseRow | undefined;
  }

  async findByDatabaseId(
    databaseId: string,
    pagination: PaginationOptions,
    opts?: { includeCreator?: boolean },
  ) {
    let query = this.db
      .selectFrom('databaseRows')
      .select([
        'databaseRows.id',
        'databaseRows.slugId',
        'databaseRows.position',
        'databaseRows.properties',
        'databaseRows.title',
        'databaseRows.icon',
        'databaseRows.databaseId',
        'databaseRows.spaceId',
        'databaseRows.workspaceId',
        'databaseRows.creatorId',
        'databaseRows.lastUpdatedById',
        'databaseRows.createdAt',
        'databaseRows.updatedAt',
      ])
      .where('databaseId', '=', databaseId)
      .where('deletedAt', 'is', null)
      .orderBy('position', (ob) => ob.collate('C').asc());

    if (opts?.includeCreator) {
      query = query.select(this.withCreator);
    }

    return executeWithPagination(query, {
      page: pagination.page,
      perPage: pagination.limit,
    });
  }

  async getLastRowPosition(databaseId: string): Promise<string | null> {
    const result = await this.db
      .selectFrom('databaseRows')
      .select('position')
      .where('databaseId', '=', databaseId)
      .where('deletedAt', 'is', null)
      .orderBy('position', (ob) => ob.collate('C').desc())
      .limit(1)
      .executeTakeFirst();

    return result?.position ?? null;
  }

  async insertRow(
    insertableRow: InsertableDatabaseRow,
    trx?: KyselyTransaction,
  ): Promise<DatabaseRow> {
    const db = dbOrTx(this.db, trx);
    return db
      .insertInto('databaseRows')
      .values(insertableRow)
      .returningAll()
      .executeTakeFirst();
  }

  async updateRow(
    updatableRow: UpdatableDatabaseRow,
    rowId: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('databaseRows')
      .set({
        ...updatableRow,
        updatedAt: new Date(),
      })
      .where('id', '=', rowId)
      .execute();
  }

  async deleteRow(rowId: string, trx?: KyselyTransaction): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('databaseRows')
      .set({ deletedAt: new Date() })
      .where('id', '=', rowId)
      .execute();
  }

  async permanentlyDeleteRow(rowId: string, trx?: KyselyTransaction): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .deleteFrom('databaseRows')
      .where('id', '=', rowId)
      .execute();
  }

  async deleteRowsByDatabaseId(databaseId: string, trx?: KyselyTransaction): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('databaseRows')
      .set({ deletedAt: new Date() })
      .where('databaseId', '=', databaseId)
      .execute();
  }

  async countRows(databaseId: string): Promise<number> {
    const result = await this.db
      .selectFrom('databaseRows')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('databaseId', '=', databaseId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    return Number(result?.count) || 0;
  }

  withCreator(eb: ExpressionBuilder<DbInterface, 'databaseRows'>) {
    return jsonObjectFrom(
      eb
        .selectFrom('users')
        .select(['users.id', 'users.name', 'users.avatarUrl'])
        .whereRef('users.id', '=', 'databaseRows.creatorId'),
    ).as('creator');
  }
}
