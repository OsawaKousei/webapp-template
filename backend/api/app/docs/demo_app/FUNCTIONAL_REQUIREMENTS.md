# 機能要件定義書（現行実装準拠）

## 1. 文書情報

- 文書名: AI Report App 機能要件定義書
- 基準実装: 現行コードベース（2026-05-02 時点）
- 対象: フロントエンド（Next.js App Router）/ バックエンド（FastAPI）
- 方針: 本書は「あるべき姿」ではなく、現行実装の挙動を仕様化する

## 2. システム概要

本システムは、Cognito 認証済みユーザー向けに、以下を提供する。

- レポートの新規作成・編集・削除
- AI による目次生成、本文生成、チャット支援、文章編集支援
- 参考文献アップロードと管理、引用管理
- レポートのエクスポート（実装上は txt/html を主に利用可能）

## 3. 役割定義

- 一般ユーザー
  - Cognito でログインし、自身のレポートのみ参照・編集・削除できる
- システム
  - Next.js API Route が BFF として動作し、FastAPI へアクセストークンを中継する
  - FastAPI が JWT 検証、DB 操作、Gemini 連携を実施する

## 4. 画面要件（UI要件）

### UI-001 ランディングページ（/）

- 目的: サービス訴求とログイン導線提供
- 表示要素:
  - ヘッダー（ロゴ、ログイン、無料で始める）
  - ヒーローセクション
  - 特徴セクション
  - ベータ訴求セクション
- 操作:
  - ログイン/無料で始める押下で /login へ遷移

### UI-002 ログインページ（/login）

- 目的: 認証開始とセッション整合性確認
- 表示要素:
  - ローディング状態（セッション確認中）
  - Google 表示付きログインボタン（実体は Cognito provider）
  - エラーメッセージ領域
  - 利用規約・プライバシーポリシーへのリンク
- 振る舞い:
  - 既存セッションありの場合 /api/user/home でトークン妥当性を確認
  - 妥当なら /home へ遷移
  - 401 等の異常時は signOut し、エラー表示
  - ログインボタン押下で next-auth の cognito サインインを開始

### UI-003 ホームページ（/home）

- 目的: ユーザーダッシュボード
- 表示要素:
  - サイドバー: ユーザー名、メール、プラン、クレジット、ログアウト、規約リンク、外部フィードバックリンク
  - メイン領域: プロジェクト検索バー、プロジェクト一覧、レポート新規作成ボタン
- 振る舞い:
  - 未認証時は /login へ遷移
  - /api/user/home でユーザープロファイル取得
  - /api/user/user-reports でレポート一覧取得
  - 検索はタイトル部分一致（クライアント側フィルタ）
  - 新規作成成功時は /new-report/{reportId} へ遷移
  - 削除操作時は確認モーダルを表示し、確定で削除API呼び出し

### UI-004 新規レポート作成（/new-report/{id}）

- 目的: ウィザード形式で本文生成前の条件入力
- 共通要件:
  - フェーズ表示（概要、参考資料、口調、目次、任意で人間らしさチェック）
  - フェーズ状態を sessionStorage に保持し、再訪時に復元
  - キャンセルで sessionStorage をクリアし /home へ遷移
- フェーズ1 概要:
  - 入力方式: テキスト入力 または 課題ファイルアップロード（二者択一）
  - ファイル形式: pdf/doc/docx/txt
  - 文字数レンジ選択（5段階）
  - AIモード選択（speed/turbo）
  - 必須条件: テキスト非空 または 課題ファイル存在
- フェーズ2 参考資料:
  - 複数ファイルアップロード（pdf/doc/docx/ppt/pptx/txt）
  - URL追加UIあり（現状 disabled、近日登場）
  - AI参考文献検索UIあり（現状 disabled、近日登場）
- フェーズ3 口調:
  - 選択肢: です・ます調 / である・だ調 / ユーザー口調（disabled）
- フェーズ4 目次:
  - AI生成された目次を表示
  - 章の追加、編集、削除、順序変更（ドラッグ/上下移動）
  - レポートタイトル編集
  - 人間らしさチェック有効化チェックボックス
- フェーズ5 人間らしさチェック（有効時のみ）:
  - 複数チェッカーを順次実行する進行UI
  - 全完了後に /report/{id} へ遷移
- 生成処理:
  - フェーズ3完了時に /api/ai/outline を呼び出し、タイトル/目次を更新
  - フェーズ4完了時に /api/ai/report を呼び出し
  - humanize 無効なら直ちに /report/{id} へ遷移

### UI-005 レポート編集ページ（/report/{id}）

- 目的: レポートの閲覧・編集・保存・AI支援
- レイアウト:
  - ヘッダー
  - 左: エディタ
  - 右: 3分割（参考文献 / AIチャット / 引用）
  - パネルは水平・垂直ともリサイズ可能
- ヘッダー要件:
  - タイトル編集、保存ボタン、エクスポートボタン、ホーム遷移
  - AIモード選択
  - 文字数/語数表示
  - 保存状態表示（saved/saving/unsaved）
  - 最終保存日時表示
  - クレジット表示
- エディタ要件:
  - 初期コンテンツ表示
  - 編集時に未保存化
  - 内容変更時に文字数/語数を再計算
  - 参考文献検索モーダル連携
- 参考文献パネル要件:
  - 参考文献一覧表示
  - 追加（ファイルまたはURL）
  - 削除
- チャットパネル要件:
  - 初期歓迎メッセージ表示
  - モード切替（一般 / 参考文献モードは disabled）
  - 送信中表示
- 引用パネル要件:
  - 引用形式選択（APA/MLA/Chicago/Harvard）
  - 引用の追加・編集・削除
  - 参考文献一覧のコピー
  - 参考文献一覧/単一引用のエディタ挿入
- 初期化要件:
  - 画面ロード時に /api/user/home と /api/report?reportId=... を並列取得

### UI-006 エクスポートモーダル

- 目的: 出力形式とオプション選択
- 表示要素:
  - 形式選択: pdf/docx/txt/html
  - オプション: 表紙ON/OFF、（pdf/docx時のみ）フォントサイズ、余白
- 現行実装上の可用状態:
  - モーダル上は pdf/docx が disabled（近日登場表示）
  - txt/html は選択可能

### UI-007 規約・プライバシーポリシー

- /terms-of-service、/privacy-policy は静的長文ページとして表示
- いずれも /home へ戻るリンクを表示

### UI-008 エディタテストページ（/editor-test）

- テスト用途ページ
- 初期JSONコンテンツを与えてエディタ動作を確認可能

## 5. 機能要件（業務機能/API）

### FR-001 認証・セッション

- next-auth は Cognito Provider を使用
- JWTセッション方式、maxAge=24時間
- セッションに accessToken を保持
- API Route は getServerSession による認証を前提とし、未認証時401を返却

### FR-002 ユーザープロファイル取得

- フロント API: GET /api/user/home
- BFF は BACKEND_URL/user/profile へ Bearer 中継
- バックエンドは認証済みユーザー情報（表示名、メール、サブスク情報、クレジット）を返却

### FR-003 ユーザーレポート一覧取得

- フロント API: GET /api/user/user-reports
- BFF は BACKEND_URL/user/reports へ中継
- バックエンドはユーザー所有レポートのみ返却

### FR-004 レポート新規作成

- フロント API: POST /api/report/new（bodyは空）
- BFF は BACKEND_URL/report/new に中継
- 成功時 reportId を返却

### FR-005 レポート取得

- フロント API: GET /api/report?reportId={id}
- BFF は BACKEND_URL/report?reportId={id} に中継
- content は文字列JSONを復元し、失敗時は代替メッセージ文書を返す

### FR-006 レポート保存

- フロント API: POST /api/report
- 入力: ReportData（title/content/wordCount/characterCount/references/quotes）
- BFF は共通 saveReport 処理で BACKEND_URL/report へ保存

### FR-007 レポート削除

- フロント API: DELETE /api/report?reportId={id}
- BFF は BACKEND_URL/report?reportId={id} に中継

### FR-008 目次生成

- フロント API: POST /api/ai/outline
- 必須: overview、aiMode、wordCount
- BFF は BACKEND_URL/ai/outline へ中継
- バックエンドは必要に応じ overviewReferenceId から参考文献本文を読み替えて生成

### FR-009 本文生成

- フロント API: POST /api/ai/report
- 必須: reportId、tone（加えてバックエンド側では overview、outline、wordCount も必須）
- BFF は BACKEND_URL/ai/report に中継
- 生成結果（markdown）を Tiptap JSON に変換し、保存処理も実行
- 返却は生成結果（title/content/reference/quote）

### FR-010 チャット支援

- フロント API: POST /api/ai/chat
- 必須: message、aiMode、chatMode
- BFF は BACKEND_URL/ai/chat に中継
- 応答 result をチャット履歴に追加

### FR-011 エディタAI支援

- フロント API: POST /api/ai/editor
- 必須: content、aiAction、aiMode
- BFF は BACKEND_URL/ai/editor に中継

### FR-012 参考文献検索

- フロント API: POST /api/ai/reference_search
- 必須: query、aiMode
- BFF は BACKEND_URL/ai/reference-search に中継

### FR-013 参考文献アップロード

- フロント API: POST /api/report/upload-file（FormData: file, report_id）
- BFF は BACKEND_URL/file/upload-file に中継
- バックエンドは
  - レポート所有者検証
  - ファイルテキスト抽出
  - 引用情報生成
  - 参考文献保存
    を行い、reference を返却

### FR-014 参考文献削除

- フロント API: DELETE /api/report/reference?referenceId={id}
- BFF は BACKEND_URL/reference/?referenceId={id} に中継

### FR-015 引用保存

- フロント API: POST /api/report/quote が存在
- 現行実装では BFF が BACKEND_URL/quote/save-quote を呼び出す
- バックエンド側には quote ルーター未実装のため、実効性はバックエンド構成に依存

### FR-016 Humanize処理

- フロント API: POST /api/report/humanize
- 入力: reportId、humanizeChecker
- 現行実装はモック（1〜2秒遅延後 success を返却）

### FR-017 エクスポート

- フロント API: POST /api/export
- 入力: format, reportTitle, content(JSONContent), options
- format=pdf は /api/export/pdf を内部呼び出し
- txt/html/docx(簡易) は文字列生成を Base64 で返却
- /api/export/pdf は Puppeteer で PDF 生成を実装

## 6. バックエンド認可要件

- 全主要APIは get_current_user 依存で認証必須
- JWT検証要件:
  - Authorization: Bearer トークン形式
  - Cognito JWKS で署名検証
  - audience は COGNITO_APP_CLIENT_ID
  - issuer は Cognito User Pool URL
- データアクセス制御:
  - report/reference は user_id 所有者検証を実施

## 7. バリデーション・エラーハンドリング要件

- BFF/APIともに必須項目未指定時 400 を返す
- 未認証時 401
- 権限不一致時 403（バックエンド）
- リソース不存在時 404（該当API）
- 予期せぬ例外時 500
- 画面側はエラー文言表示または /home・/login へフォールバック遷移を行う

## 8. 永続化・状態管理要件

- DB保存対象:
  - ユーザー、レポート、参考文献、引用関連
- クライアント一時状態:
  - 新規作成ウィザード各フェーズ入力を sessionStorage へ保持
  - キャンセル/完了時に関連キーをクリア

## 9. 非機能的な実装制約（現行仕様として扱う）

- BACKEND_URL 未設定時、BFF 経由機能は利用不可
- Humanize は現状モック処理
- エクスポートUI上は pdf/docx が disabled
- 引用保存APIのバックエンド実装整合性に注意
- 一部ログは console 出力中心（運用ログ統一は未完）

## 10. 主要ルート一覧

### フロント画面ルート

- /
- /login
- /home
- /new-report/{id}
- /report/{id}
- /terms-of-service
- /privacy-policy
- /editor-test

### フロント API ルート（BFF）

- /api/auth/[...nextauth]
- /api/user/home
- /api/user/user-reports
- /api/report/new
- /api/report (GET/POST/DELETE)
- /api/report/upload-file
- /api/report/reference (DELETE)
- /api/report/quote (POST)
- /api/report/humanize (POST)
- /api/ai/outline
- /api/ai/report
- /api/ai/chat
- /api/ai/editor
- /api/ai/reference_search
- /api/export
- /api/export/pdf

### バックエンド API ルート（FastAPI）

- /user/cognito-signup
- /user/profile
- /user/reports
- /report/new
- /report/ (GET/POST/DELETE)
- /ai/chat
- /ai/editor
- /ai/outline
- /ai/reference-search
- /ai/report
- /file/upload-file
- /reference/ (DELETE)

## 11. トレーサビリティ（根拠実装）

本書は主に以下実装を根拠に作成。

- frontend/src/app 配下ページ
- frontend/src/app/api 配下 API Routes
- frontend/src/app/\*/\_components 配下UIコンポーネント
- frontend/src/types/\*.ts
- backend/app/src/main.py
- backend/app/src/api/routers/\*.py
- backend/app/src/auth/cognito_auth.py
- backend/app/src/schemas/\*.py

## 12. 0ベース新アーキテクチャ実装計画

### 12.1 新アーキテクチャ方針（全フェーズ共通）

- フロントエンド: vite+react / cloudfront + S3
- ドメインAPI: hono
- 非同期処理: ワーカー（aws lambda, typescript）+ ジョブキュー（Redis/SQS）
- データ層: aurora db (postgres)（正規化データ）+ S3（ファイル）
- 認証: Cognito/OIDC（alphaで本実装）
- 決済: Stripe（alphaで本実装）
- 可観測性: 構造化ログ、メトリクス、トレース（beta以降強化）
- インフラ: terraform

### 12.2 フェーズ実装順序

1. 外部API呼び出しをモックしたモックアップ
2. 最低限の機能を実装したMVP
3. 認証・認可、決済を実装したアルファ版
4. 主要な機能を実装したベータ版
5. 完全なリリース版

### 12.3 フェーズ別計画

#### Phase 1: モックアップ（外部APIモック）

- 目的:
  - 画面遷移、操作導線、主要UIの体験を先行確定
  - 外部依存（LLM、認証、決済、ファイル解析）なしで検証可能にする
- 実装スコープ:
  - ページ: /, /login, /home, /new-report/{id}, /report/{id}
  - API: /api/mock/\*（固定JSON、遅延、疑似エラー）
  - エディタ、チャット、参考文献、引用、エクスポートUIの操作感再現
  - ローカル状態のみ（DB未接続）
- 除外:
  - 実認証、実課金、実LLM呼び出し、実ファイル解析
- 成果物:
  - クリック可能モックアップ
  - 画面別イベント定義（入力・押下・状態遷移）
  - モックAPI仕様（レスポンスパターン表）
- 完了条件（DoD）:
  - 主要導線で画面遷移が通る
  - 成功/失敗/ローディングのUI状態が揃う
  - デモシナリオを非開発者が再現可能

#### Phase 2: MVP（最低限機能）

- 目的:
  - 1ユーザー前提で「作って保存して再編集」が成立する最小価値を提供
- 実装スコープ:
  - レポートCRUD（タイトル・本文）
  - 新規作成ウィザード（概要/口調/目次の最小セット）
  - AI機能は1本化（例: 目次生成と本文生成のみ）
  - 参考文献は手動追加のみ（ファイルアップロードは最小）
  - DB接続（PostgreSQL）と永続化
- 技術タスク:
  - FastAPIにドメインAPI最小セット実装
  - BFFで入力バリデーションとエラー標準化
  - マイグレーション管理（Alembic）
  - 最低限の自動テスト（API単体 + 主要E2E 1本）
- 除外:
  - 厳密な認可、課金、高度なAIモード分岐
- 成果物:
  - MVP運用手順書（ローカル/ステージング）
  - API最小仕様書（OpenAPI）
- 完了条件（DoD）:
  - レポートの新規作成→保存→再読み込み→更新→削除が成功
  - 主要APIの異常系（400/500）ハンドリングが実装済み

#### Phase 3: アルファ版（認証・認可・決済）

- 目的:
  - 複数ユーザー利用を安全に成立させる
  - 事業化に必要な認証・課金基盤を導入
- 実装スコープ:
  - 認証: Cognito/OIDCログイン、セッション更新、ログアウト
  - 認可: レポート/参考文献の所有者チェック（RBAC最小）
  - 決済: Stripe Checkout、Webhook、サブスク状態反映、クレジット付与
  - 監査ログ: 重要イベント（ログイン、課金、削除）
- 技術タスク:
  - JWT検証ミドルウェア統一
  - 課金ドメインモデル追加（plan, subscription, ledger）
  - Webhook再送・重複耐性（idempotency）
  - セキュリティ基本対策（Rate limit, CSRF方針, secrets管理）
- 成果物:
  - 認証・認可フロー図
  - 課金状態遷移図と障害時リカバリ手順
- 完了条件（DoD）:
  - 未認証アクセスが保護される
  - 他ユーザー資産へのアクセスが拒否される
  - テスト決済が成功し、課金状態がDBに整合反映される

#### Phase 4: ベータ版（主要機能拡充）

- 目的:
  - 実利用可能な機能網羅と品質向上
  - 限定ユーザーに開放して運用データを収集
- 実装スコープ:
  - AI機能拡張: チャット、エディタ支援、参考文献検索
  - 参考文献機能拡張: ファイル抽出、引用整形、形式変換
  - 非同期化: 重いAI処理/ファイル処理をジョブ化
  - エクスポート拡張: pdf/docx/txt/htmlの実運用品質
  - 管理機能: 障害通知、利用分析ダッシュボード（最小）
- 品質タスク:
  - E2E自動テスト拡充
  - 性能目標設定（例: 主要画面TTFB、生成処理P95）
  - 障害注入テスト（外部API失敗時のフォールバック）
- 成果物:
  - ベータ利用ガイド
  - 既知課題一覧と優先度バックログ
- 完了条件（DoD）:
  - 主要ユースケースが手動介入なしで完了
  - ベータ運用中の重大障害に対して復旧手順が機能

#### Phase 5: リリース版（本番完全版）

- 目的:
  - 一般公開可能な運用品質・セキュリティ・サポート体制を完成
- 実装スコープ:
  - SLA/SLO運用、監視・アラート本番適用
  - データ保護（バックアップ/リストア演習、保持ポリシー）
  - 法務対応（利用規約/プライバシーポリシー最終化、同意ログ）
  - CS運用（問い合わせ導線、障害告知、FAQ）
  - 運用自動化（CI/CD gate、ロールバック戦略）
- リリースゲート:
  - セキュリティ診断クリア（主要脆弱性ゼロ）
  - 受け入れ基準達成（機能、性能、可用性）
  - 本番移行リハーサル完了
- 完了条件（DoD）:
  - 本番公開判定会を通過
  - 監視・障害対応・サポートが当番運用可能

### 12.4 横断バックログ（全フェーズで継続）

- 設計:
  - API契約のバージョニング規約
  - ドメインモデルの境界定義（Report/Reference/Billing/Auth）
- 品質:
  - テストピラミッド（Unit/Integration/E2E）
  - 失敗注入と回帰試験の定常化
- 運用:
  - 構成管理（環境変数、Secrets、Feature Flags）
  - 変更管理（ADR、リリースノート）

### 12.5 推奨マイルストーン（目安）

- M1: モックアップ完了（2〜3週間）
- M2: MVP完了（4〜6週間）
- M3: アルファ完了（4〜6週間）
- M4: ベータ完了（6〜8週間）
- M5: リリース完了（3〜4週間）

※期間はチーム規模・外部審査・決済審査状況により変動する。
