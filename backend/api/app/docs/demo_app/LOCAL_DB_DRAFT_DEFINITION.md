# ローカル検証DB 仮定義（PostgreSQL 15）

## 1. 目的

この文書は、デモアプリのローカル検証向けに用意した PostgreSQL を使って、以下を実現するための仮定義です。

- デモ操作で作成されたデータの永続化
- 検証開始前のサンプルデータ投入

本定義は暫定版です。実装の進行に合わせて更新します。

## 2. ローカルDBコンテナ前提

```yaml
db:
  image: postgres:15
  environment:
    POSTGRES_USER: local
    POSTGRES_PASSWORD: password
    POSTGRES_DB: myapp
  ports:
    - '5432:5432'
  volumes:
    - db-data:/var/lib/postgresql/data
```

接続情報（ローカル検証用）:

- Host: `localhost`
- Port: `5432`
- Database: `myapp`
- User: `local`
- Password: `password`

## 3. 設計方針（仮）

- 既存の API 型定義（`UserProfile`, `ReportDetail`, `Outline`）を基準にテーブルを構成する。
- 日時は `TIMESTAMPTZ` を使い、保存時は UTC を前提とする。
- ユーザーIDとレポートIDは `UUID` で管理する。
- 配列データ（アウトライン項目）は 1:N テーブルで正規化する。
- report が持つ reference / quote は将来拡張を見据えて内部DBに保持する（現時点フローでは0件許容）。

UUID 自動採番を使う場合は、初期化時に以下を適用する。

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 4. テーブル定義（仮）

### 4.1 users

```sql
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('standard', 'plus', 'pro')),
  credits INTEGER NOT NULL CHECK (credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.2 reports

```sql
CREATE TABLE IF NOT EXISTS reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.3 outlines

`user_id` 単位で最新アウトラインを1件保持する想定です。

```sql
CREATE TABLE IF NOT EXISTS outlines (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  overview TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.4 outline_items

```sql
CREATE TABLE IF NOT EXISTS outline_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES outlines(user_id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL CHECK (item_order >= 1),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  UNIQUE (user_id, item_order)
);
```

### 4.5 user_auth_identities

将来的な Cognito 認証連携で、Cognito の `sub` とアプリ内 `user_id` を紐付けるテーブルです。

```sql
CREATE TABLE IF NOT EXISTS user_auth_identities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('cognito')),
  auth_subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auth_provider, auth_subject),
  UNIQUE (user_id, auth_provider)
);
```

### 4.6 quotes

`Quote` 型に対応するテーブルです。

```sql
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
```

### 4.7 report_references

`Reference` 型に対応するテーブルです。1 reference は 1 quote を必ず持つ想定です。

```sql
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
```

## 5. インデックス定義（仮）

```sql
CREATE INDEX IF NOT EXISTS idx_reports_user_id_updated_at
  ON reports (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_outline_items_user_id_order
  ON outline_items (user_id, item_order ASC);

CREATE INDEX IF NOT EXISTS idx_user_auth_identities_user_id
  ON user_auth_identities (user_id);

CREATE INDEX IF NOT EXISTS idx_report_references_report_id
  ON report_references (report_id);

CREATE INDEX IF NOT EXISTS idx_report_references_quote_id
  ON report_references (quote_id);
```

## 6. サンプルデータ投入SQL（仮）

```sql
INSERT INTO users (user_id, display_name, email, subscription_plan, credits)
VALUES ('11111111-1111-4111-8111-111111111111', 'Gemini Node', 'gemini@example.com', 'standard', 120)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_auth_identities (user_id, auth_provider, auth_subject)
VALUES ('11111111-1111-4111-8111-111111111111', 'cognito', 'cognito-sub-example-001')
ON CONFLICT (auth_provider, auth_subject) DO NOTHING;

INSERT INTO reports (report_id, user_id, title, content)
VALUES (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'AI Report Draft',
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Initial draft content for demo"}]}]}'::jsonb
)
ON CONFLICT (report_id) DO NOTHING;

INSERT INTO outlines (user_id, overview, title)
VALUES ('11111111-1111-4111-8111-111111111111', 'AI活用に関するレポートの概要', 'AI活用レポート')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO outline_items (user_id, item_order, title, summary)
VALUES
  ('11111111-1111-4111-8111-111111111111', 1, '背景', '現状と課題を整理する'),
  ('11111111-1111-4111-8111-111111111111', 2, '活用例', '業務でのAI活用パターンを示す'),
  ('11111111-1111-4111-8111-111111111111', 3, '今後の展望', '段階的な導入計画を提案する')
ON CONFLICT (user_id, item_order) DO NOTHING;

-- 現時点の処理フローでは reference / quote は空で運用可能。
-- 将来拡張時に quotes と report_references の INSERT を追加する。
```

## 7. 初期化手順（仮）

1. PostgreSQL コンテナを起動する。
2. 本文書の DDL（4章, 5章）を `myapp` DB に適用する。
3. 6章のサンプルデータ投入SQLを実行する。
4. アプリからサンプル UUID ユーザーでデータ参照できることを確認する。

## 8. 未確定事項

- `reports.content` は `JSONB` を正本として確定する。本文抽出用の `content_text` は必要になった時点で追加検討する。
- Cognito 導入時、`user_auth_identities` への登録タイミング（初回ログイン時自動作成など）を確定する。
- reference / quote の更新タイミング（レポート保存時の全置換 or 差分更新）を確定する。
- 監査要件が必要な場合は更新者カラム（`created_by`, `updated_by`）を追加する。
