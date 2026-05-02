import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

type CreateDatabaseClientInput = {
  readonly connectionString: string;
};

export type DatabaseClient = NodePgDatabase;

export const createDatabaseClient = ({
  connectionString,
}: CreateDatabaseClientInput): DatabaseClient => {
  const pool = new Pool({
    connectionString,
  });

  return drizzle(pool);
};
