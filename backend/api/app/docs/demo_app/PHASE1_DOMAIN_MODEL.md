# Phase 1 ドメインモデル定義

## 1. 目的

本ドキュメントは、Phase 1 の最小APIを実装するためのドメインモデルを定義する。

対象API:

- GET /api/users/me
- GET /api/users/me/reports
- POST /api/ai/generate-outline
- POST /api/ai/generate-report

この文書の役割:

- API I/O 型の前に、業務上の意味を固定する
- 実装時のレイヤ分離を明確化する

## 2. ドメイン境界

Phase 1 は以下の3ドメインで構成する。

- User ドメイン
  - ログイン済みユーザーの最小プロフィール取得
  - ユーザー所有レポート一覧取得
- AI ドメイン
  - 目次生成（outline）
  - 目次を入力として本文生成

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

### 6.1 画面遷移とドメインイベント

- /new-report 目次生成
  - イベント: OutlineGenerated

## 7. APIとドメイン対応

### 7.1 GET /api/users/me

- 入力: なし（認証コンテキスト）
- 出力: UserProfile

### 7.2 GET /api/users/me/reports

- 入力: なし（認証コンテキスト）
- 出力: ReportSummary[]

### 7.3 POST /api/ai/generate-outline

- 入力:
  - overview: string
  - aiMode: AiMode
  - wordCount: WordCountRange
- 出力:
  - title: string
  - outline: { items: OutlineItem[] }
- 振る舞い:
  - リクエスト入力から都度生成して返す
  - 生成した outline は永続化しない

### 7.4 POST /api/ai/generate-report

- 入力:
  - overview: string
  - tone: 'formal' | 'balanced' | 'casual'
- 出力:
  - reportId: string
  - title: string
  - content: string
- 振る舞い:
  - overview から outline を都度生成し、本文を作成する
  - 生成された report は保存される

## 8. エラー分類

- VALIDATION_ERROR
  - 必須項目不足、形式不正
- FORBIDDEN
  - 他ユーザー資産へのアクセス
- INTERNAL_SERVER_ERROR
  - 予期せぬ障害

## 9. 実装時の注意

- Context 依存は Router 層に限定する
- Service 層は Result で分岐を返し throw しない
- Repository で永続モデルからドメインモデルへ変換する
- 型は Zod スキーマを正とし、z.infer で導出する
