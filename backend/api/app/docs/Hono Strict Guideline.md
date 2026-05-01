# **Hono Strict Guideline**

**Extension of TypeScript Basic Guideline & Architecture Strategy**

## **1\. 基本方針 (Core Philosophy)**

本規約は「TypeScript Basic Guideline」の関数型アプローチ・不変性を継承し、Honoを用いたバックエンド開発の標準を定める。

### **1.1 Hono as an Interface**

Hono（およびミドルウェア）は、あくまで「HTTPインターフェース層」でのみ使用する。 ビジネスロジック（Service層）が Hono の Context (c) に依存してはならない。

### **1.2 Explicit Dependency**

グローバルステート（モジュールレベルのミュータブルな変数）を禁止し、すべての依存関係（DB接続、ロガー、外部クライアント）は Dependency Injection (DI) によって解決する。Honoにおいては、c.var（Context Variables）または高階関数を用いて注入する。

## ---

**2\. アーキテクチャとレイヤー (Architecture & Layers)**

アプリケーションを以下の3層に厳格に分離する。依存の方向は **Router \-\> Service \-\> Repository** の一方通行とする。 クラスを使用せず、データと関数を分離するアプローチを徹底する。

| Layer | Component | Role | Input | Output |
| :---- | :---- | :---- | :---- | :---- |
| **Interface** | Router | @hono/zod-openapiによるルーティングとバリデーション | Zod Schema | JSON / HTTP Status |
| **Domain** | Service | 純粋関数によるビジネスロジック  | Domain Type | Result\<T, Error\>  |
| **Infrastructure** | Repository | Drizzle/DynamoDBを用いた永続化 | Domain Type | Result\<T, Error\>  |

### **2.1 Router (Controller)**

* **責務:** Zodによる入力バリデーション、Serviceの実行、ts-patternを用いたHTTPレスポンスへのマッピング。  
* **禁止:** 複雑な条件分岐や計算などのロジック記述。

### **2.2 Service (Domain Logic)**

* **責務:** アプリケーションの核心となるロジック。

* **特徴:** HonoやDBドライバに依存しない純粋関数。

* **禁止:** 例外（throw）の送出。必ず neverthrow の Result 型を返す。

### **2.3 Repository (Persistence)**

* **責務:** データの取得と保存。

* **特徴:** type（Interfaceの代替）として抽象化され、Drizzle等の実装詳細を隠蔽する。

## ---

**3\. データモデルとスキーマ (Data Models & Schemas)**

Zodを「Single Source of Truth」とし、入力と出力を厳格に分離する。

### **3.1 Schema Strategy (入力と出力の分離)**

1つのモデルを使い回すことを禁止し、ユースケースごとにZodスキーマを定義する。

* **Input Schema:** @hono/zod-openapi の request 用スキーマ。  
* **Output Schema:** @hono/zod-openapi の responses 用スキーマ。  
* **Domain Model:** アプリケーション内部で回すデータ。Zodから z.infer で生成する。

### **3.2 ORM Model Isolation**

* **ルール:** Drizzle等から返却されるDB固有の型は、**Repositoryの内部のみ**に生存期間を限定する。

* Repositoryは必ず DB Model \-\> Domain Model の変換を行ってから値を返すこと。

**4\. 環境変数管理 (Environment Variables)**

Lambda等の環境における設定漏れを防ぐため、Zodを用いた厳格な検証を行う。

* **ルール:** アプリケーションの起動時（またはエントリーポイント）にZodで process.env をパースし、型安全な設定オブジェクトを生成する。  
* **禁止:** アプリケーションコードの随所で process.env.XXX を直接参照すること。

```TypeScript

import { z } from 'zod';

const EnvSchema \= z.object({  
  DATABASE\_URL: z.string().url(),  
  LOG\_LEVEL: z.enum(\['info', 'debug', 'error'\]).default('info'),  
});

export const env \= EnvSchema.parse(process.env);
```

**5\. エラーハンドリング (Error Handling)**

「ネイティブ Result パターンの採用」をWeb APIに適用する。

### **5.1 Service Layer**

例外（throw）を使用せず、neverthrow の Result 型を返す。

```TypeScript

// features/user/user-service.ts  
import { ok, err, Result } from 'neverthrow'; //

export const getUser \= async (uid: string, repo: UserRepository): Promise\<Result\<User, NotFoundError\>\> \=\> {  
  const result \= await repo.find(uid);  
  return result; // RepositoryもResultを返す前提  
};
```

### **5.2 Router Layer**

Serviceから返された Result を ts-pattern の match でハンドリングし\[cite: 1\]、適切なHTTPステータスに変換する。

```TypeScript
// features/user/user-router.ts  
import { match } from 'ts-pattern'; //\[cite: 1\]

app.openapi(route, async (c) \=\> {  
  const { uid } \= c.req.valid('param');  
  const repo \= c.var.userRepository;  
    
  const result \= await getUser(uid, repo);

  return match(result)  
    .when(  
      (r) \=\> r.isOk(),  
      (r) \=\> c.json(r.value, 200)  
    )  
    .when(  
      (r) \=\> r.isErr() && r.error.type \=== 'NOT\_FOUND',  
      (r) \=\> c.json({ error: r.error.message }, 404)  
    )  
    .otherwise(() \=\> c.json({ error: 'Internal Server Error' }, 500));  
});
```

**6\. ロギング (Logging)**

「宣言的記述」と「構造化ログ」を採用する。

### **6.1 Logging Strategy**

* **Structured Logs:** pino を使用し、JSON形式で出力して機械可読性を担保する。

* **Context Aware:** Honoのミドルウェアを使用し、すべてのログに requestId などのコンテキストを自動付与する。

```TypeScript

import { pinoLogger } from 'hono-pino';

app.use('\*', pinoLogger({  
  pino: { level: env.LOG\_LEVEL },  
  http: { reqId: () \=\> crypto.randomUUID() }  
}));
```

**7\. フロントエンドとの連携 (Frontend Integration)**

Hono RPCは使用せず、型の共有を通じて安全なコントラクトを確立する。

* **ルール:** バックエンドリポジトリに shared/types モジュールを作成し、Zodスキーマから推論された型（z.infer）およびAPIの入出力型をエクスポートする。  
* **運用:** モノレポ構成（Turborepo等）またはnpmパッケージとして、フロントエンドからこの types モジュールをインポートして利用する。

**8\. ディレクトリ構造 (Directory Structure)**

「機能単位の構造 (Feature-based Structure)」を採用する。

```Plaintext
src/  
  ├── app.ts                  \# Honoアプリケーションの定義とDI
  ├── env.ts                  \# Zodによる環境変数定義  
  ├── features/               \# ビジネスドメインごとの分割
  │   └── user/  
  │       ├── user-router.ts  \# @hono/zod-openapiによるEndpoint
  │       ├── user-service.ts \# 振る舞い (純粋関数)
  │       ├── user-schema.ts  \# Zod Schema
  │       └── user-repo.ts    \# Repository Type定義
  ├── infrastructure/         \# 技術的詳細の実装
  │   ├── db/  
  │   │   ├── drizzle-repo.ts \# Concrete Repository Implementation
  │   │   └── schema.ts       \# Drizzle Schema  
  │   └── external/           \# 外部API連携
  └── shared/                 \# フロント/バックエンド共通コンポーネント
      ├── types/              \# フロントエンド共有用モジュール  
      └── errors/             \# カスタムエラー型 (Result用)
```