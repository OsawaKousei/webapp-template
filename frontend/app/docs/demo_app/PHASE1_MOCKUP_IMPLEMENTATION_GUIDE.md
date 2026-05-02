# Phase 1 モックアップ実装ガイド

## 1. 目的
本ドキュメントは、Phase 1（外部API呼び出しをモックしたモックアップ）を、現行実装を参考にしつつ新アーキテクチャで実装するための実装指針を定義する。

対象:
- 画面遷移と主要UI体験の再現
- 外部依存を排除したモックAPIによる挙動再現
- Phase 2（MVP）以降に流用できる設計・記述ルール整備

非対象:
- 実認証、実決済、実LLM呼び出し
- 本番DB接続

## 2. 現行実装の参照ポイント（Phase 1で再現する範囲）

### 2.1 画面導線
- ランディング: /
- ログイン: /login
- ホーム: /home
- 新規作成: /new-report/{id}
- 編集: /report/{id}

### 2.2 主要UI要素
- ホーム: プロジェクト一覧、検索、作成、削除確認モーダル
- 新規作成: フェーズウィザード（概要/参考資料/口調/目次/人間らしさチェック）
- 編集: エディタ、参考文献、AIチャット、引用、ヘッダー保存状態
- 共通: 通知モーダル、ローディング、エラー表示

### 2.3 モック対象API（現行BFFを参考）
- レポート: /api/report, /api/report/new
- AI: /api/ai/outline, /api/ai/report, /api/ai/chat, /api/ai/editor, /api/ai/reference_search
- 参考文献: /api/report/upload-file, /api/report/reference
- ユーザー: /api/user/home, /api/user/user-reports
- 補助: /api/report/humanize, /api/export

## 3. ライブラリ選定（Phase 1推奨）

## 3.1 フロントエンド
- React + TypeScript
  - 理由: UI再利用性と型安全性、MVP以降への移行容易性
- Vite
  - 理由: 開発サイクル高速化、静的配信前提と相性が良い
- react-router-dom
  - 理由: 画面遷移要件が明確で、学習コストと実装コストが低い
- Tailwind CSS
  - 理由: 既存UIの再現がしやすく、試作スピードが高い
- Radix UI（または shadcn/ui）
  - 理由: モーダル、ドロップダウンなどのアクセシブルな基盤部品を再利用可能
- React Hook Form + Zod
  - 理由: ウィザード入力のバリデーションを簡潔に記述できる
- Zustand
  - 理由: ウィザード状態やUI状態の管理が軽量で扱いやすい
- Tiptap
  - 理由: 現行編集体験との整合を維持しやすい
- TanStack Query
  - 理由: モックAPIを本番APIに差し替える際の変更を最小化できる

## 3.2 モック/テスト
- MSW（Mock Service Worker）
  - 理由: ブラウザ側でHTTPをインターセプトし、API契約の形でモックできる
- Vitest + Testing Library
  - 理由: コンポーネント/ユースケース単位のテストが高速
- Playwright（任意）
  - 理由: 主要導線のE2E確認を自動化しやすい

## 3.3 バックエンド（モックAPIサーバを併用する場合）
- Hono + TypeScript
  - 理由: 新アーキテクチャ方針に一致、軽量でモック実装が速い
- zod-openapi（任意）
  - 理由: モックAPI契約をOpenAPI化してMVP移行時の差分を減らせる

## 4. 再利用しやすい設計・記述ルール

### 4.1 ディレクトリ設計（Feature First）
推奨:
```text
src/
  app/
    routes/
  features/
    auth/
      api/
      components/
      hooks/
      schemas/
      types/
    report/
    editor/
    reference/
  shared/
    api/
    components/
    lib/
    styles/
    types/
```

原則:
- 画面固有コードは feature 配下
- APIクライアントは feature/api に集約
- 複数機能で使うUIは shared/components

### 4.2 API契約の統一
レスポンス形式（推奨）:
```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

エラー形式（推奨）:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

原則:
- 画面はHTTPステータスとerror.codeの両方で分岐
- 400/401/403/404/500 の取り扱いを共通化

### 4.3 型・スキーマの分離
- UI型: 画面で使うViewModel
- API型: API I/O用DTO
- バリデーション: Zodスキーマ

原則:
- APIレスポンスを画面で直接使わず、mapperでViewModelに変換
- モックデータもスキーマ検証して品質を担保

### 4.4 状態管理
- サーバ状態: TanStack Query
- クライアント状態: Zustand
- フォーム状態: React Hook Form

原則:
- ウィザード進捗は1ストアに集約
- sessionStorage永続化はストア層で実施し、UIから直接アクセスしない

### 4.5 コンポーネント設計
- Presentational と Container を分離
- 1コンポーネント1責務
- Propsは最小化し、イベント名は動詞で統一

例:
- onSave
- onDelete
- onGenerateOutline

### 4.6 命名と記述
- ファイル名: kebab-case
- Reactコンポーネント: PascalCase
- 関数/変数: camelCase
- boolean: is/has/can で開始

記述方針:
- 早期returnを優先
- 非同期エラーは try/catch で明示
- マジックナンバーは定数化

### 4.7 UI状態の標準化
全API連携UIで以下を必須化:
- idle
- loading
- success
- empty
- error

原則:
- スケルトン/スピナー表示ルールを共通化
- エラー時の再試行導線を配置

## 5. モック戦略

### 5.1 モックデータ方針
- static seeds: 画面初期表示用
- scenario factories: 正常/空/異常の動的生成
- latency simulation: 200ms, 800ms, 2000ms を使い分け

### 5.2 シナリオマトリクス（最小）
- ユーザー情報取得: success / 401 / 500
- レポート一覧: success(複数) / empty / 500
- 目次生成: success / timeout / validation error
- 本文生成: success / partial failure / 500
- ファイルアップロード: success / size error / type error

### 5.3 切替方式
- 開発時: MSW有効
- CIテスト時: MSW deterministic mode
- MVP移行時: 環境変数でAPIベースURLを差し替え

## 6. Phase 1 実装バックログ（推奨順）
1. プロジェクト雛形（Vite+React+TS+Tailwind+Router）
2. 共通レイアウト、通知、共通UI部品
3. 画面ルート作成（/, /login, /home, /new-report/:id, /report/:id）
4. APIクライアント層 + MSWハンドラ作成
5. ホーム（一覧/検索/作成/削除モーダル）
6. 新規作成ウィザード（状態永続化含む）
7. 編集画面（エディタ/参考文献/チャット/引用のUI連携）
8. エラーステート/ローディング整備
9. ユニットテスト + 主要導線E2E
10. デモシナリオ文書化

## 7. Phase 1 完了判定（DoD）
- 主要5画面の導線が通る
- モックAPIで成功/失敗/遅延を再現できる
- 入力バリデーションとエラー表示が統一されている
- 主要導線の自動テストが通る
- MVP移行時にAPI差し替え可能な構造になっている

## 8. MVP移行時に残すべき実装上の工夫
- APIレスポンスをDTOで吸収し、UIへ直接露出させない
- モックデータと実データで同一スキーマを使う
- feature単位で依存方向を固定（shared -> features は禁止）
- 画面イベントをanalyticsフックに集約（将来の分析導入を容易化）

## 9. リスクと回避策（Phase 1時点）
- リスク: モックが実API契約と乖離する
  - 回避: OpenAPI草案を先行し、MSWを契約駆動で更新
- リスク: UIだけ先行して状態管理が肥大化
  - 回避: Zustand storeをfeature分割し、sliceごとに責務固定
- リスク: ウィザード仕様変更に弱い
  - 回避: phase定義を定数テーブル化し、分岐ロジックを集約

---
このドキュメントは Phase 1 の実装標準であり、Phase 2開始時に「差分（継続採用/置換/廃止）」を必ずレビューする。
