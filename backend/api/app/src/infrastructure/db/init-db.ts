import { Pool } from 'pg';
import { env } from '@/src/env';

const LOCAL_DEFAULT_DATABASE_URL =
  'postgres://local:password@localhost:5432/myapp';
const CONTAINER_DEFAULT_DATABASE_URL =
  'postgres://local:password@db:5432/myapp';

type InitAttemptResult =
  | {
    readonly ok: true;
    readonly connectionString: string;
  }
  | {
    readonly ok: false;
    readonly error: unknown;
  };

const statements: readonly string[] = [
  'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
  'DROP TABLE IF EXISTS report_references CASCADE;',
  'DROP TABLE IF EXISTS quotes CASCADE;',
  'DROP TABLE IF EXISTS outline_items CASCADE;',
  'DROP TABLE IF EXISTS user_auth_identities CASCADE;',
  'DROP TABLE IF EXISTS reports CASCADE;',
  'DROP TABLE IF EXISTS outlines CASCADE;',
  'DROP TABLE IF EXISTS users CASCADE;',
  `
  CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('standard', 'plus', 'pro')),
    credits INTEGER NOT NULL CHECK (credits >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS outlines (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    overview TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS outline_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES outlines(user_id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL CHECK (item_order >= 1),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    UNIQUE (user_id, item_order)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS user_auth_identities (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    auth_provider TEXT NOT NULL CHECK (auth_provider IN ('cognito')),
    auth_subject TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (auth_provider, auth_subject),
    UNIQUE (user_id, auth_provider)
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS quotes (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    source TEXT NOT NULL,
    page TEXT,
    reference_type TEXT CHECK (reference_type IN ('book', 'article', 'website')),
    authors TEXT,
    title TEXT,
    year TEXT,
    publisher TEXT,
    journal TEXT,
    volume TEXT,
    issue TEXT,
    pages TEXT,
    url TEXT,
    access_date TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS report_references (
    id BIGSERIAL PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(report_id) ON DELETE CASCADE,
    quote_id BIGINT NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    object_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (quote_id)
  );
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_reports_user_id_updated_at
    ON reports (user_id, updated_at DESC);
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_outline_items_user_id_order
    ON outline_items (user_id, item_order ASC);
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_user_auth_identities_user_id
    ON user_auth_identities (user_id);
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_report_references_report_id
    ON report_references (report_id);
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_report_references_quote_id
    ON report_references (quote_id);
  `,
];

const initializeSchema = async (connectionString: string): Promise<void> => {
  const pool = new Pool({
    connectionString,
  });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await statements.reduce<Promise<void>>((previous, statement) => {
      return previous.then(async () => {
        await client.query(statement);
      });
    }, Promise.resolve());

    await client.query('COMMIT');
    console.log('Database schema reset and initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

const isErrorWithCode = (
  error: unknown,
): error is {
  readonly code?: string;
  readonly message?: string;
} => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'code' in error || 'message' in error;
};

const run = async (): Promise<void> => {
  const candidateConnectionStrings =
    env.DATABASE_URL === undefined
      ? [LOCAL_DEFAULT_DATABASE_URL, CONTAINER_DEFAULT_DATABASE_URL]
      : [env.DATABASE_URL];

  if (env.DATABASE_URL === undefined) {
    console.warn(
      'DATABASE_URL is not set. Trying localhost and docker service defaults.',
    );
  }

  const initialAttempt: InitAttemptResult = {
    ok: false,
    error: new Error('No connection attempt has started.'),
  };

  const attemptResult = await candidateConnectionStrings.reduce<
    Promise<InitAttemptResult>
  >((previousPromise, connectionString) => {
    return previousPromise.then(async (previous) => {
      if (previous.ok) {
        return previous;
      }

      try {
        await initializeSchema(connectionString);

        return {
          ok: true,
          connectionString,
        };
      } catch (error) {
        return {
          ok: false,
          error,
        };
      }
    });
  }, Promise.resolve(initialAttempt));

  if (attemptResult.ok) {
    console.log(
      `Database schema reset and initialized successfully (${attemptResult.connectionString}).`,
    );
    return;
  }

  if (
    isErrorWithCode(attemptResult.error) &&
    attemptResult.error.code === 'ECONNREFUSED'
  ) {
    throw new Error(
      'PostgreSQL connection was refused. Start the DB container, or set DATABASE_URL explicitly.',
    );
  }

  throw attemptResult.error;
};

run().catch((error: unknown) => {
  console.error('Failed to initialize database schema.');
  console.error(error);
  process.exit(1);
});
