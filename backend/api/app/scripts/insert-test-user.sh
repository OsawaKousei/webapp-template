#!/usr/bin/env bash

set -euo pipefail

LOCAL_DEFAULT_DATABASE_URL="postgres://local:password@localhost:5432/myapp"
CONTAINER_DEFAULT_DATABASE_URL="postgres://local:password@db:5432/myapp"

TEST_USER_ID="8a4fd8d8-bf5e-4c77-b6bc-c52ff4f82e9d"
TEST_USER_DISPLAY_NAME="Test User"
TEST_USER_EMAIL="test-user@example.com"
TEST_USER_SUBSCRIPTION_PLAN="standard"
TEST_USER_CREDITS="100"

if [[ -n "${DATABASE_URL:-}" ]]; then
  CANDIDATES=("$DATABASE_URL")
else
  echo "DATABASE_URL is not set. Trying localhost and docker service defaults."
  CANDIDATES=("$LOCAL_DEFAULT_DATABASE_URL" "$CONTAINER_DEFAULT_DATABASE_URL")
fi

SQL=$(cat <<EOSQL
INSERT INTO users (
  user_id,
  display_name,
  email,
  subscription_plan,
  credits
)
VALUES (
  '${TEST_USER_ID}',
  '${TEST_USER_DISPLAY_NAME}',
  '${TEST_USER_EMAIL}',
  '${TEST_USER_SUBSCRIPTION_PLAN}',
  ${TEST_USER_CREDITS}
)
ON CONFLICT (user_id) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  subscription_plan = EXCLUDED.subscription_plan,
  credits = EXCLUDED.credits,
  updated_at = NOW();
EOSQL
)

run_insert() {
  local connection_string="$1"

  if PGPASSWORD=password psql "$connection_string" -v ON_ERROR_STOP=1 <<<"$SQL"; then
    echo "Test user inserted successfully (${TEST_USER_ID}) via ${connection_string}."
    return 0
  fi

  return 1
}

for connection_string in "${CANDIDATES[@]}"; do
  if run_insert "$connection_string"; then
    exit 0
  fi
done

echo "Failed to insert test user."
echo "PostgreSQL connection failed for all candidates. Start DB container or set DATABASE_URL explicitly."
exit 1
