# Phase 1 開発計画（現行ガイドライン優先版）

## 1. 目的

本計画は、モックアップ段階（Phase 1）を現行ワークスペースの実装規約に厳密準拠して進めるための実行計画である。

重視順:

1. 現行ガイドライン（Basic Guideline / Hono Strict / Testing Strategy）
2. 現在のコード構造・テスト構造・運用スクリプト
3. 添付のモック実装ガイド（参考）

## 2. 現在地（2026-05-02）

- Hono + TypeScript strict + Zod + neverthrow + ts-pattern の最小構成は稼働済み
- Router-Service-Repository の分離は user ドメインで実装済み
- Unit/Integration テストは Vitest で実装済み
- in-memory repository があり、Phase 1 のモック基盤に流用可能
- 機能は /api/user（単一）に限定され、demo_app 要件に対して不足

## 3. Phase 1 スコープ定義（このリポジトリで実装する範囲）

### 3.1 実装対象

- モックAPIの提供（フロントの主要導線を成立させるための最小契約）
- API契約（Zodスキーマ）の共有定義
- 疑似状態遷移（成功/失敗/遅延）の再現
- テスト自動化（Unit/Integration）

### 3.2 実装しないもの

- 実認証（Cognito本接続）
- 実決済（Stripe本接続）
- 実DB永続化
- 実LLM連携
- 実ファイル解析

## 4. 設計原則（必須）

- レイヤ依存は Router -> Service -> Repository の一方向のみ
- Service/Repository は Result 型（neverthrow）を返し、throw を使わない
- 入出力スキーマは Zod で定義し、shared/types を正とする
- src/features/_/_-schema.ts は shared/types の橋渡しに限定
- 依存注入は createApp 引数経由で明示し、グローバル mutable state を持たない
- 環境変数は env.ts の Zod parse 経由のみ
- テストは Vitest 統一、Fake 優先、vi.mock 原則不使用
- class / enum / interface / switch / 命令型ループ乱用を避ける

## 5. 実装方針（モックAPI）

### 5.1 API提供戦略

Phase 1 では、本番同等の業務ロジックではなく、画面遷移成立に必要な最小契約のみを実装する。

実装対象API（最小セット）:

1. GET /api/users/me
2. GET /api/users/me/reports
3. POST /api/reports/temp-drafts
4. POST /api/ai/generate-outline
5. POST /api/ai/generate-report
6. POST /api/reports/:reportId
7. GET /api/reports/:reportId

画面遷移との対応:

- /login -> /home: GET /api/users/me
- /home 初期表示: GET /api/users/me + GET /api/users/me/reports
- /home -> /new-report/:tempDraftId: POST /api/reports/temp-drafts
- /new-report/:tempDraftId で目次生成: POST /api/ai/generate-outline
- /new-report/:tempDraftId で本文生成実行: POST /api/ai/generate-report
- 生成完了後に保存: POST /api/reports/:reportId
- /new-report/:tempDraftId -> /report/:reportId: 保存成功後に遷移
- /report/:reportId 初期表示: GET /api/users/me + GET /api/reports/:reportId

new-report の状態保持方針:

- 入力フォーム状態は sessionStorage に tempDraftId 単位で保持する
- tempDraftId は POST /api/reports/temp-drafts でバックエンド発行する
- /new-report/:tempDraftId の再読み込み時は sessionStorage から復元する
- /home に遷移した時点で tempDraftId 関連キーを削除し、再入場時は復元しない

### 5.2 ドメイン分割

features 配下を以下に分割する。

- user
- ai
- report

各ドメインで以下を統一する。

- <domain>-schema.ts
- <domain>-repo.ts
- <domain>-service.ts
- <domain>-router.ts

### 5.3 後回しスコープ（画面内操作・モーダル起点）

以下は「画面遷移を伴わない操作」のため、Phase 1 では実装対象外とする。

- レポート削除（確認モーダル含む）
- レポート保存（明示保存・自動保存）
- 目次生成、チャット、エディタAI支援
- 参考文献の追加・削除・検索
- 引用の追加・編集・削除
- humanize 処理
- エクスポート（txt/html/pdf/docx）

### 5.4 API設計・命名の改善案（新規開発前提）

現行仕様の命名揺れ・責務混在を避けるため、以下を採用する。

1. リソース名を複数形に統一する

- /api/report -> /api/reports
- /api/user/user-reports -> /api/users/me/reports

2. ID指定はクエリではなくパスに統一する

- /api/report?reportId={id} -> /api/reports/:reportId

3. スネークケースのパスを廃止する

- /api/ai/reference_search -> /api/references/search

4. 動詞エンドポイントを最小化し、用途を明示する

- /api/ai/report -> /api/ai/generate-report
- 目次生成は /api/ai/generate-outline で明示する
- tempDraftId 払い出しは /api/reports/temp-drafts で明示する

5. user と users の使い分けを統一する

- 現在ユーザーは /users/me
- 管理用途など特定ユーザーは /users/:userId

6. 互換性は持たず、新命名へ完全統一する

- Phase 1 の時点で旧命名APIは廃止する

## 6. WBS（5営業日想定）

### Day 1-2: 契約固定と土台整備

- 画面遷移に必要な最小7APIの I/O 契約を確定
- shared/types にドメイン別スキーマを追加
- AppError をドメイン共通で使える形に拡張
- createApp でドメイン単位DIが可能な入力型へ拡張
- 旧API名を廃止する非互換方針を定義
- tempDraftId ベースの sessionStorage キー設計を定義

成果物:

- shared/types/\* の初版（minimal）
- app.ts のDI拡張
- 影響範囲の typecheck/lint/test グリーン

### Day 3-4: user/ai/report の最小実装

- GET /api/users/me 実装
- GET /api/users/me/reports 実装
- POST /api/reports/temp-drafts 実装
- POST /api/ai/generate-outline 実装
- POST /api/ai/generate-report 実装
- POST /api/reports/:reportId 実装
- GET /api/reports/:reportId 実装
- in-memory state repository を report/tempDraft 向けに追加
- 404/400/500 の返却規約を統一

成果物:

- features/ai, features/report 一式
- tests/unit/features/ai, tests/unit/features/report
- tests/integration/features/ai, tests/integration/features/report

### Day 5: シナリオ完成・品質締め

- レスポンススキーマ監査（最小7API）
- README に実行手順とモック動作一覧を記載
- テスト・lint・typecheck の最終固定

成果物:

- docs/demo_app/PHASE1_API_SCENARIOS.md
- README 追記
- CI通過状態

## 7. テスト計画

### 7.1 Unit

- 対象: service
- 方針: fake repository を引数注入
- 観点: 正常系、NOT_FOUND、VALIDATION_ERROR、INTERNAL_SERVER_ERROR

### 7.2 Integration

- 対象: router
- 方針: createApp + app.request で HTTP 契約を検証
- 観点: status、body schema、error mapping、x-request-id ヘッダー

### 7.3 最低カバレッジ目標

- statement 80%
- branch 70%
- critical path（user/ai/report）は 85% 以上

## 8. 完了条件（DoD）

- /login, /home, /new-report/:tempDraftId, /report/:reportId の導線が最小APIで成立している
- 最小7APIで入力検証とエラーコードマッピングが一貫している
- /new-report/:tempDraftId の再読み込みで入力状態が復元される
- /home に戻った後は new-report 入力状態が復元されない
- unit/integration テストが整備され、npm run test が成功する
- npm run lint と npm run typecheck が成功する
- API契約（shared/types）と実装が乖離していない
- README とシナリオ文書で、非開発者でもデモ再現できる

## 9. リスクと対策

- リスク: UI側想定とAPI契約のズレ
  - 対策: shared/types を唯一の契約に固定し、差分は schema 起点で解決
- リスク: モック実装が肥大化してMVP移行時の負債化
  - 対策: repository 境界を厳守し、モックロジックを service に閉じ込める
- リスク: テストの遅延
  - 対策: unit先行で仕様固定、integration は API単位で段階追加

## 10. 実行順（着手時の具体タスク）

1. shared/types に user/ai/report の minimal schema 追加
2. features/user の reports 一覧エンドポイント追加
3. features/report の router/service/repo 実装（issue tempDraftId/save/get）
4. features/ai の router/service/repo 実装（generate-outline/generate-report）
5. tempDraftId の sessionStorage 管理（復元/削除条件）を実装
6. tests/fakes に fake-report-repo と fake-temp-draft-repo を追加
7. report/ai の unit/integration テスト追加
8. ドキュメント整備と最終検証

## 11. API公開ポリシー（Phase 1）

- Phase 1: 画面遷移成立を優先し、APIは最小実装
- 互換aliasは提供しない（非互換リリース）
- 旧命名APIの利用は禁止し、実装・テスト・ドキュメントを新命名へ統一する
- Phase 2: 後回し機能を同一命名規則で順次追加する
- OpenAPI 仕様を shared/types と同時更新し、命名の再発散を防止する

## 12. 補足

この計画は「Phase 1 の完成を最短で達成しつつ、Phase 2 で実APIへ差し替えやすい構造」を最優先としている。したがって、速度よりも契約整合性とレイヤ分離を優先する。
