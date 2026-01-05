import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('databases')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`),
    )
    .addColumn('slug_id', 'varchar', (col) => col.notNull())
    .addColumn('title', 'varchar', (col) => col)
    .addColumn('icon', 'varchar', (col) => col)
    .addColumn('properties', 'jsonb', (col) => col.defaultTo(sql`'[]'::jsonb`))
    .addColumn('view_config', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('page_id', 'uuid', (col) =>
      col.references('pages.id').onDelete('cascade'),
    )
    .addColumn('space_id', 'uuid', (col) =>
      col.references('spaces.id').onDelete('cascade').notNull(),
    )
    .addColumn('workspace_id', 'uuid', (col) =>
      col.references('workspaces.id').onDelete('cascade').notNull(),
    )
    .addColumn('creator_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deleted_at', 'timestamptz', (col) => col)
    .addUniqueConstraint('databases_slug_id_unique', ['slug_id'])
    .execute();

  await db.schema
    .createIndex('databases_slug_id_idx')
    .on('databases')
    .column('slug_id')
    .execute();

  await db.schema
    .createIndex('databases_page_id_idx')
    .on('databases')
    .column('page_id')
    .execute();

  await db.schema
    .createIndex('databases_workspace_id_idx')
    .on('databases')
    .column('workspace_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('databases').execute();
}
