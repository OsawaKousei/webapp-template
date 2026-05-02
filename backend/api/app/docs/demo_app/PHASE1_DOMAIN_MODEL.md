# Phase 1 ドメインモデル定義

## 1. 目的

本ドキュメントは、Phase 1 の最小APIを実装するためのドメインモデルを定義する。

対象API:

- GET /api/users/me
- GET /api/users/me/reports
- GET /api/reports/outline
- DELETE /api/reports/outline
- POST /api/ai/generate-outline

この文書の役割:

- API I/O 型の前に、業務上の意味を固定する
- 単一 Outline の責務境界を固定する
- 実装時のレイヤ分離を明確化する

## 2. ドメイン境界

Phase 1 は以下の3ドメインで構成する。

- User ドメイン
  - ログイン済みユーザーの最小プロフィール取得
  - ユーザー所有レポート一覧取得
- Report ドメイン
  - ユーザー単位の単一 Outline の管理
- AI ドメイン
  - 目次生成（outline）

依存方向:

- Router -> Service -> Repository

## 3. 識別子モデル

### 3.1 UserId

- 型: string
- 意味: 認証済みユーザーの一意識別子
- 備考: 外部認証IDとのマッピングはインフラ側責務

### 3.2 ReportId

- 型: string
- 意味: 保存済みレポートの永続識別子
- 備考: Phase 1 では生成・保存の対象外。既存一覧表示の参照キーとしてのみ扱う

## 4. エンティティ定義

### 4.1 UserProfile

- id: UserId
- displayName: string
- email: string
- subscriptionPlan: 'standard' | 'plus' | 'pro'
- credits: number

不変条件:

- id は空文字不可
- email はメール形式
- credits は 0 以上

### 4.2 ReportSummary

- reportId: ReportId
- title: string
- lastModifiedAt: string (ISO8601)

不変条件:

- reportId は空文字不可
- title は空文字不可

### 4.3 Outline

- userId: UserId
- overview: string
- title: string
- items: OutlineItem[]
- createdAt: string (ISO8601)
- updatedAt: string (ISO8601)

不変条件:

- overview は空文字不可
- title は空文字不可
- items は 1 件以上

## 5. 値オブジェクト

### 5.1 OutlineItem

- title: string
- summary: string
- order: number

不変条件:

- order は 1 以上
- 同一 Outline 内で order は重複不可

### 5.2 WordCountRange

- minWordCount: number
- maxWordCount: number

不変条件:

- minWordCount >= 0
- maxWordCount >= minWordCount

### 5.3 AiMode

- 値: 'speed' | 'turbo'

## 6. ライフサイクル

### 6.1 Outline 状態遷移

- outline 不在（null）-> outline 存在
  - トリガ: POST /api/ai/generate-outline 成功
- outline 存在 -> deleted
  - トリガ:
    - DELETE /api/reports/outline
    - 新規作成時に破棄を選択

### 6.2 Outline の運用ルール

- ユーザーごとに Outline は最大 1 件のみ保持する
- /home から新規作成開始時、既存 Outline があれば UI で継続/破棄を確認する
- 破棄選択時は DELETE /api/reports/outline で抹消する
- 継続選択時に上書き生成する場合は、POST /api/ai/generate-outline に overwriteExisting=true を付与する

### 6.3 画面遷移とドメインイベント

- /home -> /new-report
  - イベント: OutlinePrepared
- /new-report 目次生成
  - イベント: OutlineGenerated

## 7. APIとドメイン対応

### 7.1 GET /api/users/me

- 入力: なし（認証コンテキスト）
- 出力: UserProfile

### 7.2 GET /api/users/me/reports

- 入力: なし（認証コンテキスト）
- 出力: ReportSummary[]

### 7.3 GET /api/reports/outline

- 入力: なし（認証コンテキスト）
- 出力: Outline | null
- 仕様:
  - null は「Outline が保存されていない状態」を意味する
  - Outline が存在する場合、title と items は必須で返す

### 7.4 DELETE /api/reports/outline

- 入力: なし（認証コンテキスト）
- 出力: 削除結果
- 振る舞い:
  - 既存 Outline を抹消

### 7.5 POST /api/ai/generate-outline

- 入力:
  - overview: string
  - aiMode: AiMode
  - wordCount: WordCountRange
  - overwriteExisting?: boolean（既存 Outline がある場合のみ有効）
- 出力:
  - title: string
  - outline: { items: OutlineItem[] }
- 振る舞い:
  - 既存 Outline がない場合は新規生成
  - 既存 Outline がある場合:
    - overwriteExisting=true なら上書き更新
    - overwriteExisting が未指定または false なら CONFLICT

## 8. エラー分類

- VALIDATION_ERROR
  - 必須項目不足、形式不正
- NOT_FOUND
  - outline が存在しない
- FORBIDDEN
  - 他ユーザー資産へのアクセス
- CONFLICT
  - 既存 Outline がある状態で overwriteExisting=true なしに上書きを要求
- INTERNAL_SERVER_ERROR
  - 予期せぬ障害

## 9. 実装時の注意

- Context 依存は Router 層に限定する
- Service 層は Result で分岐を返し throw しない
- Repository で永続モデルからドメインモデルへ変換する
- 型は Zod スキーマを正とし、z.infer で導出する
