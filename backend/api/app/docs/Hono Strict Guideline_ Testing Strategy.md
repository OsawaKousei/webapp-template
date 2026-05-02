# **Hono Strict Guideline: Testing Strategy**

**Extension of TypeScript Basic Guideline & Architecture Strategy**

## **1\. テスト基本方針 (Core Philosophy)**

本プロジェクトでは、「Minimal」かつ「Explicit」なテストコードを維持するため、**Vitest エコシステムのみ**を採用し、関数型アプローチを徹底します。

### **1.1 Pure TypeScript Testing**

- **No Magic:** vi.mock によるモジュールの「黒魔術的な」書き換えを原則禁止します。

- **Explicit DI:** テスト対象への依存（DBクライアント、外部APIクライアント等）の注入は、引数や Hono の Context (c.var) 経由で明示的に行います。

- **Fake over Mock:** 依存関係の代替には、モックライブラリ（Spy/Mock）ではなく「Fake（偽装オブジェクト）」の使用を第一選択とします。

### **1.2 Testing Pyramid Strategy**

| Type            | Target         | Scope        | Dependencies            | Strategy                                        |
| :-------------- | :------------- | :----------- | :---------------------- | :---------------------------------------------- |
| **Unit**        | Domain / Logic | **Solitary** | **Fake Implementation** | ロジックの網羅的検証。DBレスで高速に実行。      |
| **Integration** | Hono App (API) | **Sociable** | **Real DB / Docker**    | エンドツーエンドの結合検証。外部APIのみMock化。 |

## ---

**2\. 技術スタック (Tech Stack)**

テストの複雑化を防ぐため、以下のライブラリ群で統一します。

- **Runner:** vitest (高速かつ TypeScript との親和性が高いため)
- **HTTP Client:** Hono 標準の app.request() (サーバーを起動せずインメモリで高速にテスト可能)
- **Data Factory:** @faker-js/faker \+ 自作のファクトリ関数 (Zod スキーマと連携)
- **Coverage:** @vitest/coverage-v8
- **Mocking (Restricted):** vi (Vitest標準)
  - _注:_ Date.now() の固定（vi.setSystemTime）や、Fake作成が困難なサードパーティライブラリ（AWS SDKなど）の制御にのみ限定的に使用します。

## ---

**3\. ディレクトリ構造 (Directory Structure)**

テストコードも「関心の分離」に従い、Unit（Solitary）とIntegration（Sociable）を物理的に分離します。

Plaintext

tests/  
 ├── setup.ts \# 全体共通のSetup (テスト用DBの初期化, Env設定等)  
 ├── fakes/ \# 再利用可能なFakeオブジェクト群  
 │ └── fake-user-repo.ts  
 ├── unit/ \# Unit Tests (DB不要・高速)  
 │ └── domain/  
 │ └── user/  
 │ └── validate-user.test.ts  
 └── integration/ \# Integration Tests (DB必要・低速)  
 └── api/  
 └── user/  
 └── user-router.test.ts

## ---

**4\. Unit Test 戦略 (The Fake Pattern)**

ドメインロジックのテストでは、クラスを使用せず、関数の引数として単純なオブジェクト（Fake）を注入します。また、エラーハンドリングは neverthrow の Result 型で検証します。

### **4.1 Fakeの実装 (in tests/fakes/)**

状態（プロパティ）とロジック（メソッド）を結合させないよう、クロージャーを用いてFake関数群を生成します。

TypeScript

// tests/fakes/fake-user-repo.ts  
import { ok, err, Result } from 'neverthrow'; //\[cite: 1\]  
import type { User } from '@/domain/user/types';

// クラスを使用せず、関数とクロージャーでFakeを実装\[cite: 1\]  
export const createFakeUserRepo \= () \=\> {  
 // DBの代わりとなるインメモリ状態  
 const storage \= new Map\<string, User\>();

return {  
 save: async (user: User): Promise\<Result\<User, Error\>\> \=\> {  
 storage.set(user.id, user);  
 return ok(user); // Result型で成功を返す\[cite: 1\]  
 },  
 find: async (uid: string): Promise\<Result\<User, Error\>\> \=\> {  
 const user \= storage.get(uid);  
 if (\!user) return err(new Error('User not found')); // Result型で失敗を返す\[cite: 1\]  
 return ok(user);  
 },  
 } as const;  
};

### **4.2 テストケースの実装 (in tests/unit/)**

vi.mock を使わず、関数の引数（明示的なDI）で依存を解決します。

TypeScript

// tests/unit/domain/user/user-service.test.ts  
import { describe, test, expect } from 'vitest';  
import { processUser } from '@/domain/user/service';  
import { createFakeUserRepo } from '@/tests/fakes/fake-user-repo';  
import { userFactory } from '@/tests/factories/user-factory';

describe('processUser', () \=\> {  
 test('既存ユーザーが正しく取得できること', async () \=\> {  
 // Arrange: Fakeを準備し、データを仕込む  
 const fakeRepo \= createFakeUserRepo();  
 const existingUser \= userFactory.build({ id: 'user_123' });  
 await fakeRepo.save(existingUser);

    // Act: 関数にFakeを注入 (Explicit DI)
    const result \= await processUser('user\_123', fakeRepo);

    // Assert: Result型の正常系を検証\[cite: 1, 2\]
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.id).toBe('user\_123');
    }

});

test('ユーザーが存在しない場合、エラーを返すこと', async () \=\> {  
 // Arrange: 空のFake\[cite: 2\]  
 const fakeRepo \= createFakeUserRepo();

    // Act
    const result \= await processUser('non\_existent', fakeRepo);

    // Assert: Result型の異常系を検証\[cite: 1, 2\]
    expect(result.isErr()).toBe(true);

});  
});

## ---

**5\. Integration Test 戦略 (The Sociable Pattern)**

Honoのエンドポイントテストでは、実際のDB（PostgreSQL/DynamoDBのローカルコンテナ等）を使用し、app.request() を通してリクエストを送ります\[cite: 2\]。

### **5.1 依存性の注入 (Hono Context)**

外部APIなどの依存関係のみを差し替えるため、テスト用のHonoアプリケーションインスタンスを構築します。

TypeScript

// tests/integration/api/user/user-router.test.ts  
import { describe, test, expect, beforeEach } from 'vitest';  
import { createApp } from '@/app';  
import { db } from '@/tests/setup'; // 実際のテスト用DB接続 (Drizzle等)\[cite: 2\]

// 外部APIクライアントのFake\[cite: 2\]  
const fakeEmailClient \= {  
 send: async () \=\> ok(undefined),  
};

describe('GET /users/:id', () \=\> {  
 test('正常に200レスポンスとユーザー情報が返ること', async () \=\> {  
 // Arrange: テスト対象のアプリケーションを構築し、依存を注入  
 const app \= createApp({  
 db, // Real DB  
 emailClient: fakeEmailClient, // Fake External System\[cite: 2\]  
 });

    // Act: Hono標準機能を用いたインメモリHTTPリクエスト
    const response \= await app.request('/users/user\_123');

    // Assert
    expect(response.status).toBe(200);
    const body \= await response.json();

    // Zodスキーマ（または型生成）を使用してレスポンスの妥当性を検証\[cite: 1, 2\]
    expect(body.id).toBe('user\_123');

});  
});

## ---

**6\. データ生成 (Data Generation)**

テストデータの作成に巨大なオブジェクトリテラルを使用することを禁止します\[cite: 2\]。必ずファクトリ関数を使用します。

- **理由:** スキーマ変更時の修正コストを下げるため\[cite: 2\]。
- **使用法:** Zodスキーマのデフォルト値や @faker-js/faker を組み合わせ、必要なフィールドのみ build() 等で上書きします\[cite: 2\]。

TypeScript

// tests/factories/user-factory.ts  
import { faker } from '@faker-js/faker';  
import type { User } from '@/domain/user/types';

export const userFactory \= {  
 // 必要なフィールドのみ上書き可能にする\[cite: 2\]  
 build: (overrides: Partial\<User\> \= {}): User \=\> ({  
 id: overrides.id ?? faker.string.uuid(),  
 name: overrides.name ?? faker.person.fullName(),  
 isActive: overrides.isActive ?? true,  
 ...overrides,  
 }),  
} as const; // as const で固定\[cite: 1\]

// GOOD\[cite: 2\]  
const user \= userFactory.build({ id: '1', name: 'Test' });

## ---

**7\. 設定ファイル (vitest.config.ts)**

カバレッジ計測の設定を強制し、テスト漏れを防ぎます\[cite: 2\]。

TypeScript

// vitest.config.ts  
import { defineConfig } from 'vitest/config';  
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({  
 plugins: \[tsconfigPaths()\],  
 test: {  
 globals: false, // グローバル変数への汚染を防ぐため明示的にimportさせる  
 environment: 'node',  
 include: \['tests/\*\*/\*.test.ts'\], //\[cite: 2\]  
 setupFiles: \['./tests/setup.ts'\],  
 coverage: {  
 provider: 'v8',  
 reporter: \['text', 'html'\], //\[cite: 2\]  
 include: \['src/\*\*/\*.ts'\], //\[cite: 2\]  
 exclude: \['src/\*\*/types.ts', 'src/index.ts'\],  
 thresholds: {  
 // テストカバレッジが低い場合に失敗させる\[cite: 2\]  
 lines: 80,  
 functions: 80,  
 branches: 80,  
 statements: 80,  
 },  
 },  
 },  
});
