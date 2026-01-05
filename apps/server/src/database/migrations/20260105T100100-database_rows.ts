import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('database_rows')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`),
    )
    .addColumn('slug_id', 'varchar', (col) => col.notNull())
    .addColumn('position', 'varchar', (col) => col)
    .addColumn('properties', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('title', 'varchar', (col) => col)
    .addColumn('icon', 'varchar', (col) => col)
    .addColumn('content', 'jsonb', (col) => col)
    .addColumn('ydoc', 'bytea', (col) => col)
    .addColumn('text_content', 'text', (col) => col)
    .addColumn('database_id', 'uuid', (col) =>
      col.references('databases.id').onDelete('cascade').notNull(),
    )
    .addColumn('space_id', 'uuid', (col) =>
      col.references('spaces.id').onDelete('cascade').notNull(),
    )
    .addColumn('workspace_id', 'uuid', (col) =>
      col.references('workspaces.id').onDelete('cascade').notNull(),
    )
    .addColumn('creator_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('last_updated_by_id', 'uuid', (col) =>
      col.references('users.id'),
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deleted_at', 'timestamptz', (col) => col)
    .addUniqueConstraint('database_rows_slug_id_unique', ['slug_id'])
    .execute();

  await db.schema
    .createIndex('database_rows_slug_id_idx')
    .on('database_rows')
    .column('slug_id')
    .execute();

  await db.schema
    .createIndex('database_rows_database_id_idx')
    .on('database_rows')
    .column('database_id')
    .execute();

  await db.schema
    .createIndex('database_rows_position_idx')
    .on('database_rows')
    .column('position')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('database_rows').execute();
}
