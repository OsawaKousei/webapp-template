# Phase 1 開発計画（Workspace優先版）

## 1. 目的

本計画は、`docs/demo_app/PHASE1_MOCKUP_IMPLEMENTATION_GUIDE.md` を参考にしつつ、**現行の実装状態とリポジトリ内ガイドラインを最優先**して、Phase 1（モックアップ）を完了させるための実行計画を定義する。

優先順位:

1. `docs/BasicGuideline.md`
2. `docs/Widget-Oriented React Guideline.md`
3. `docs/Tailwind-Based Styling Guideline.md`
4. 現在のワークスペース構成・既存実装
5. `docs/demo_app/PHASE1_MOCKUP_IMPLEMENTATION_GUIDE.md`（参考）

## 2. 現状評価（2026-05-02）

### 2.1 すでにあるもの

- Vite + React + TypeScript + Tailwind の基盤
- L3 Layout (`src/layouts/dashboard-layout.tsx`) と、L2/L1のサンプル実装（`user-profile`, `demo-playground`）
- Zustand, TanStack Query, Zod, neverthrow, ts-pattern 導入済み
- Vitest（unit/integration）と Playwright（e2e）実行基盤
- `src/components/ui/` に shadcn運用の入口（button）

### 2.2 Phase 1観点で不足しているもの

- 主要ルート（`/`, `/login`, `/home`, `/new-report/:id`, `/report/:id`）
- モックAPI契約の統一形式とハンドラ群
- レポート一覧/検索/作成/削除の一連導線
- 新規作成ウィザード（phase状態 + sessionStorage 永続化）
- 編集画面の統合UI（エディタ/参考文献/チャット/引用）
- 成功/失敗/遅延のシナリオ制御
- 主要導線のE2E整備

## 3. Phase 1 スコープ定義

### 3.1 対象（In Scope）

- 画面:
  - `/`
  - `/login`
  - `/home`
  - `/new-report/:id`
  - `/report/:id`
- API:
  - `/api/mock/*`（フロント内モック）
  - 既存 feature の API 呼び出しはモック経由に統一
- UI状態:
  - `idle/loading/success/empty/error`
- データ管理:
  - サーバ状態: TanStack Query
  - クライアント状態: Zustand
  - ウィザード一時保存: store層で sessionStorage
- テスト:
  - Unit: ロジック関数・store action
  - Integration: Widget中心
  - E2E: 主要導線（ハッピーパス + 代表失敗系）

### 3.2 非対象（Out of Scope）

- 実認証（Cognito実連携）
- 実LLM呼び出し
- 実DB接続
- 実決済
- 本番品質のファイル解析

## 4. 設計方針（現行ガイドライン準拠）

### 4.1 レイヤー責務

- L1 Pure Views: 描画のみ。外部依存禁止。
- L2 Widgets: Query/Store接続、データ取得とイベント配線。
- L3 Layouts: 配置のみ。prop drillingで状態中継しない。

### 4.2 TypeScript/構文制約

- `type` を使用（`interface` 不使用）
- `any` 不使用、`unknown` + narrowing
- `class/enum/switch/for/while` 不使用
- 関数はアロー関数
- 不変更新を原則化

### 4.3 Styling方針

- Tailwindのセマンティックトークン中心
- app層で arbitrary value を極力回避
- 共有UIは `src/components/ui/` を利用（Vendor codeに過度改変しない）

### 4.4 API契約

共通レスポンス形式を採用:

- success:
  - `{ success: true, data: ..., message?: string }`
- error:
  - `{ success: false, error: { code: string, message: string } }`

## 5. 実装バックログ（優先順）

### B1. ルーティング基盤

- `react-router-dom` 導入
- 5画面ルート追加
- レイアウトとルート責務分離
- 404/フォールバック導線

### B2. モックAPI層

- `src/shared/api/` にAPIクライアント共通化
- MSWハンドラ実装（ユーザー/レポート/AI/参考文献/エクスポート）
- レイテンシ（200ms/800ms/2000ms）とエラー注入切替

### B3. ホーム画面（/home）

- 一覧、検索、作成、削除確認モーダル
- loading/empty/error の表示統一
- 新規作成遷移（`/new-report/:id`）

### B4. 新規作成ウィザード（/new-report/:id）

- phase定義テーブル化（概要/参考資料/口調/目次/人間らしさ）
- Zustand store に集約
- sessionStorage 永続化（store層責務）
- outline/report/humanize のモック連携

### B5. 編集画面（/report/:id）

- ヘッダー（保存状態/文字数/モード）
- 左エディタ + 右3パネル（参考文献/チャット/引用）
- パネルの最低限リサイズ体験
- 保存、エクスポート（txt/html中心）のモック導線

### B6. クロスカット

- ローディング/エラーUI部品の共通化
- 型定義とmapper整理（API DTO -> ViewModel）
- 機能別 public API（index.ts）調整

### B7. テスト

- Unit: store action / util（境界値含む）
- Integration: 各Widgetの loading/success/error/empty
- E2E: 主要5画面を跨ぐデモシナリオ

## 6. スプリント計画（目安: 3週間）

### Sprint 1（Week 1）

目標: 骨格完成（遷移とモック基盤）

- B1 完了
- B2 完了
- `/home` の最小表示（一覧取得まで）
- CIで `lint/typecheck/test` が通る状態

### Sprint 2（Week 2）

目標: コア体験完成（作成フロー）

- B3 完了
- B4 完了
- 新規作成から `report/:id` への遷移成立
- Integration test を重点追加

### Sprint 3（Week 3）

目標: 編集体験と品質ゲート

- B5 完了
- B6/B7 完了
- E2E主要シナリオを通す
- デモ手順書更新

## 7. 受け入れ基準（DoD）

- 主要5画面の遷移が成立
- 各主要APIで success/error/latency を再現可能
- 各画面で loading/success/empty/error が表示できる
- ガイドライン違反がない（lint/typecheck通過）
- 自動テスト:
  - unit/integration/e2e がグリーン

## 8. 実行コマンド（検証）

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- 必要に応じて `npm run dev` で手動導線確認

## 9. リスクと回避策

- モック契約の乖離
  - 対策: DTOスキーマ（Zod）をモック入出力に適用
- ウィザード状態の肥大化
  - 対策: phaseごとslice分割 + action責務固定
- UI先行で技術負債化
  - 対策: Widget単位で「配線テスト」を先に追加
- ガイドライン逸脱
  - 対策: ESLintルールで禁止構文を継続検出

## 10. 成果物一覧

- 実装コード（5画面 + mock API + store + widget）
- テストコード（unit/integration/e2e）
- デモシナリオ文書（再現手順）
- 本計画書（Phase 1 開発計画）

## 11. Phase 2へ引き継ぐ設計負債を残さない条件

- API呼び出しはクライアント層経由のみ（直fetchを禁止）
- DTO/ViewModel分離を維持
- feature外から `components/` へ直接importしない
- 画面層で sessionStorage に直接触れない
- 主要イベントを追跡可能な形（hook化可能）で命名統一
