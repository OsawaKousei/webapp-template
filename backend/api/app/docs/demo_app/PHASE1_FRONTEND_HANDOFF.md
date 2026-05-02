# Phase 1 フロントエンド引き継ぎ

## 1. 目的

本ドキュメントは、現時点のバックエンド実装を前提として、フロントエンド実装へ安全に着手するための引き継ぎ情報をまとめる。

対象スコープ:

- ログイン後ホーム表示
- new-report 画面での outline 生成
- 既存 outline の継続/破棄確認
- 本文生成
- エディター初期表示と保存

非対象:

- 本文リライト・高度編集支援
- 参考文献/引用管理

## 2. 実装済みAPI（Phase 1）

### 2.1 GET /api/users/me

- 目的: ログインユーザー情報取得
- 成功レスポンス 200:

```json
{
  "id": "u123",
  "displayName": "Gemini Node",
  "email": "gemini@example.com",
  "subscriptionPlan": "standard",
  "credits": 120
}
```

- エラー:
  - 404 `{ "error": "User not found" }`
  - 500 `{ "error": "..." }`

### 2.2 GET /api/users/me/reports

- 目的: ユーザー所有レポート一覧取得
- 成功レスポンス 200:

```json
[
  {
    "reportId": "r-001",
    "title": "AI Report Draft",
    "lastModifiedAt": "2026-05-01T10:00:00.000Z"
  }
]
```

### 2.3 GET /api/reports/outline

- 目的: 既存 outline の有無確認
- 成功レスポンス 200:
  - 既存あり: Outline オブジェクト
  - 既存なし: `null`

Outline 例:

```json
{
  "userId": "u123",
  "overview": "AI レポートの概要",
  "title": "AI レポートの概要",
  "items": [
    { "title": "導入", "summary": "AI レポートの概要", "order": 1 },
    { "title": "本論", "summary": "論点を整理して説明する", "order": 2 },
    { "title": "結論", "summary": "要点をまとめる", "order": 3 }
  ],
  "createdAt": "2026-05-02T11:00:00.000Z",
  "updatedAt": "2026-05-02T11:00:00.000Z"
}
```

### 2.4 DELETE /api/reports/outline

- 目的: 既存 outline の破棄
- 成功レスポンス 200:

```json
{ "success": true }
```

### 2.5 POST /api/ai/generate-outline

- 目的: outline 生成
- リクエスト:

```json
{
  "overview": "AI レポートの概要",
  "aiMode": "speed",
  "wordCount": {
    "minWordCount": 500,
    "maxWordCount": 1000
  },
  "overwriteExisting": false
}
```

- 成功レスポンス 200:

```json
{
  "title": "AI レポートの概要",
  "outline": {
    "items": [
      { "title": "導入", "summary": "AI レポートの概要", "order": 1 },
      { "title": "本論", "summary": "論点を整理して説明する", "order": 2 },
      { "title": "結論", "summary": "要点をまとめる", "order": 3 }
    ]
  }
}
```

- エラー:
  - 400: バリデーションエラー（例: overview が空白のみ）
  - 409: 既存 outline あり + `overwriteExisting=true` なし
    - `{ "error": "Outline already exists" }`
  - 500: 内部エラー

### 2.6 POST /api/ai/generate-report

- 目的: outline から本文を生成し、保存済みレポートとして返却
- リクエスト:

```json
{
  "tone": "balanced"
}
```

- 成功レスポンス 200:

```json
{
  "reportId": "f6f6d1c7-fd2b-4a8f-b2fc-e9c2a4fcd2a3",
  "title": "AI レポートの概要",
  "content": "# AI レポートの概要\n..."
}
```

- エラー:
  - 404: 生成元 outline がない
    - `{ "error": "Outline not found" }`
  - 500: 内部エラー

### 2.7 GET /api/reports/{reportId}

- 目的: エディター初期表示用のレポート本文取得
- 成功レスポンス 200:

```json
{
  "reportId": "r-100",
  "userId": "u123",
  "title": "保存済みタイトル",
  "content": "保存済み本文",
  "createdAt": "2026-05-01T10:00:00.000Z",
  "updatedAt": "2026-05-01T10:00:00.000Z"
}
```

- エラー:
  - 404: 対象レポートなし
    - `{ "error": "Report not found" }`
  - 500: 内部エラー

### 2.8 POST /api/reports/{reportId}

- 目的: エディター編集結果の保存
- リクエスト:

```json
{
  "title": "編集後タイトル",
  "content": "編集後本文"
}
```

- 成功レスポンス 200:
  - `GET /api/reports/{reportId}` と同じ形式

## 3. フロント実装フロー

### 3.1 /home 初期表示

1. `GET /api/users/me`
2. `GET /api/users/me/reports`

### 3.2 /home -> /new-report

1. `GET /api/reports/outline`
2. レスポンスが `null`:
   - そのまま new-report 入場
3. レスポンスが Outline:
   - モーダルで「継続 / 破棄」を選択
   - 継続: 既存 outline を画面へ反映

- 破棄: `DELETE /api/reports/outline` 実行後に空状態で開始

### 3.3 /new-report で outline 生成

1. `POST /api/ai/generate-outline`
2. 既存 outline がある前提で上書きする場合のみ `overwriteExisting=true` を付与
3. 200 レスポンスの `title` と `outline.items` を画面に反映

### 3.4 /new-report で本文生成 -> /report/:reportId 遷移

1. `POST /api/ai/generate-report` を実行
2. 200 レスポンスで取得した `reportId` へ遷移（`/report/{reportId}`）
3. 遷移先初期表示で `GET /api/reports/{reportId}` を実行して本文を取得
4. エディター保存時に `POST /api/reports/{reportId}` を実行

## 4. overwriteExisting のルール

- 既存 outline がない場合:
  - `overwriteExisting` は不要
- 既存 outline がある場合:
  - `overwriteExisting=true` で上書き生成
  - 未指定または `false` の場合は 409

## 5. バリデーション前提

- `overview`: trim 後に 1文字以上必須
- `wordCount.maxWordCount >= wordCount.minWordCount`
- `aiMode`: `speed` または `turbo`

## 6. エラーUIの最低要件

- 400: 入力不正メッセージ表示
- 409: 継続/破棄モーダル再表示（既存データありを明示）
- 500: 再試行導線付きトーストまたはアラート
- 404: outline/report 不在時は再生成または一覧戻り導線を表示

## 7. 実装チェックリスト

- `/home` でユーザー情報とレポート一覧が表示される
- `/new-report` 入場時に既存 outline 判定が動作する
- 継続/破棄の分岐が API 仕様どおりに動作する
- 空白 overview は送信前検証、または 400 応答でハンドリングされる
- 409 の場合に overwriteExisting=true で再実行できる
- 生成した reportId でエディターへ遷移し、GET で本文再取得できる
- エディター更新を POST /api/reports/{reportId} で保存できる

## 8. 既知の制約

- 本文生成はモック生成ロジック（テンプレート文面）
- 保存は in-memory 実装のためプロセス再起動で消える
- 認証は固定ユーザー前提のモック実装
