#!/usr/bin/env bash

set -euo pipefail

LOCAL_DEFAULT_DATABASE_URL="postgres://local:password@localhost:5432/myapp"
CONTAINER_DEFAULT_DATABASE_URL="postgres://local:password@db:5432/myapp"

if [[ -n "${DATABASE_URL:-}" ]]; then
  CANDIDATES=("$DATABASE_URL")
else
  echo "DATABASE_URL is not set. Trying localhost and docker service defaults."
  CANDIDATES=("$LOCAL_DEFAULT_DATABASE_URL" "$CONTAINER_DEFAULT_DATABASE_URL")
fi

SQL=$(cat <<'EOSQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS "references" CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS outline_items CASCADE;
DROP TABLE IF EXISTS user_auth_identities CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS outlines CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('standard', 'plus', 'pro')),
  credits INTEGER NOT NULL CHECK (credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outlines (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  overview TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outline_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES outlines(user_id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL CHECK (item_order >= 1),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  UNIQUE (user_id, item_order)
);

CREATE TABLE IF NOT EXISTS user_auth_identities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('cognito')),
  auth_subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auth_provider, auth_subject),
  UNIQUE (user_id, auth_provider)
);

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

CREATE TABLE IF NOT EXISTS "references" (
  id BIGSERIAL PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(report_id) ON DELETE CASCADE,
  quote_id BIGINT NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  object_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (quote_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id_updated_at
  ON reports (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_outline_items_user_id_order
  ON outline_items (user_id, item_order ASC);

CREATE INDEX IF NOT EXISTS idx_user_auth_identities_user_id
  ON user_auth_identities (user_id);

CREATE INDEX IF NOT EXISTS idx_references_report_id
  ON "references" (report_id);

CREATE INDEX IF NOT EXISTS idx_references_quote_id
  ON "references" (quote_id);
EOSQL
)

run_init() {
  local connection_string="$1"

  if PGPASSWORD=password psql "$connection_string" -v ON_ERROR_STOP=1 <<<"$SQL"; then
    echo "Database schema reset and initialized successfully ($connection_string)."
    return 0
  fi

  return 1
}

for connection_string in "${CANDIDATES[@]}"; do
  if run_init "$connection_string"; then
    exit 0
  fi
done

echo "Failed to initialize database schema."
echo "PostgreSQL connection failed for all candidates. Start DB container or set DATABASE_URL explicitly."
exit 1
