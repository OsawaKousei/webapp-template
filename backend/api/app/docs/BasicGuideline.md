# 1. 基本原則 (Core Principles)

## 1.1 Simple is Best (単純さの追求)

定義: 「書くのが短いコード」ではなく、「読む際の認知的負荷が最小のコード」を最良とする。
適用:
高度な抽象化（継承、Mixin、Decorator、Metaprogramming）は、コードの挙動を追うために「知識」を要求するため禁止する。
誰が読んでも、上から下へ読むだけでロジックが理解できる「手続き的なフロー（ただし副作用は局所化）」を好む。

## 1.2 Immutable by Default (不変性の原則)

定義: データは作成された瞬間から変更されないものとして扱う。
適用:
let による再代入は、状態の追跡を困難にする最大の要因であるため、原則として排除する。
データの変更が必要な場合は、既存の値を変更（Mutation）するのではなく、新しい値を生成（Creation）する。

## 1.3 Functional Style, Not OOP (データと振る舞いの分離)

定義: クラスベースのオブジェクト指向ではなく、データ（Type）と関数（Function）を分離するアプローチを採用する。
適用:
状態（プロパティ）とロジック（メソッド）を結合させない。
関数は可能な限り「純粋関数（同じ入力に対して常に同じ出力を返し、外部に影響を与えない）」として設計する。

## 1.4 AI Consistency (AI との協業プロトコル)

定義: 本規約は、人間だけでなく AI エージェントに対する指示書としても機能する。
適用:
AI が学習データに含まれる「古い JS の慣習（var, loop, prototype）」を出力した場合、それはバグとみなして拒絶する。
レビューコストを下げるため、AI には常にこの規約（Minimal TS）の範囲内でコード生成を要求する。

# 2. ツールチェーンと環境設定 (Tooling & Environment)

人間の意志ではなく、ツールによる自動強制によって品質を担保します。

## 2.1 コンパイラ設定 (tsconfig.json)

TypeScript コンパイラの最高レベルの厳格さを有効にします。
strict: true: 基本的な型チェックの厳格化。
noUncheckedIndexedAccess: true: 配列やオブジェクトへのアクセス時、常に undefined の可能性を強制的にチェックさせる（最重要設定）。
noImplicitReturns: true: 関数内のすべてのパスで戻り値を保証する。
exactOptionalPropertyTypes: true: オプショナルプロパティに対して、意図しない undefined の代入を防ぐ。

## 2.2 リンター設定 (ESLint)

構文レベルで使用禁止機能をブロックします。
Rule: no-restricted-syntax を使用し、言語仕様の一部を物理的に禁止する。
ClassDeclaration (クラス禁止)
TSEnumDeclaration (Enum 禁止)
TSInterfaceDeclaration (Interface 禁止)
SwitchStatement (Switch 禁止)
ForStatement, WhileStatement (命令型ループ禁止)

## 2.3 フォーマッタ (Prettier)

コードの見た目に関する議論を排除します。
Single Quote: 文字列はシングルクォート ' に統一。
Semi: セミコロン ; はあり（ASI による予期せぬ挙動防止）。
Trailing Comma: 末尾カンマ all（diff を見やすくするため）。

# 3. 禁止・制限される構文 (Restricted Syntax)

TypeScript/JavaScript の機能のうち、**「使用してはならないもの（Blacklist）」**を定義します。

## 3.1 class の禁止

理由: this の挙動による混乱、継承による複雑化を防ぐため。
代替: データ構造は type (Object Literal)、振る舞いは Pure Function を使用する。

## 3.2 enum の禁止

理由: コンパイル後のコード量増大、数値/文字列の曖昧さ回避のため。
代替: Union Type ('active' | 'inactive') または as const オブジェクトを使用する。

## 3.3 interface の禁止

理由: Declaration Merging（同名定義のマージ）による意図しない型汚染を防ぐため。
代替: すべて type (Type Alias) で定義する。

## 3.4 ループ構文 (for, while) の禁止

理由: インデックス管理のミス（Off-by-one error）や、手続き的な状態変更を防ぐため。
代替: 配列メソッド (map, filter, reduce) を基本とする。ただし、reduce が複雑になりすぎる場合は、可読性を優先して for...of を使用する。

## 3.5 switch 文の禁止

理由: break 漏れの危険性、冗長な記述を避けるため。
代替: `ts-pattern` によるパターンマッチング（Sec 9.3 参照）、オブジェクトマップ、または if 文を使用する。

## 3.6 三項演算子 (? :) の厳格な制限

ルール: 単純な値の切り替え（例: const x = isOk ? 1 : 0）のみ許可する。
禁止: 関数呼び出しを含むもの、ネストされた三項演算子は禁止。
代替: if 文と早期リターン、または関数への切り出しを行う。

# 4. 変数とデータ構造 (Variables & Data Structures)

状態の変化（Mutation）を極限まで減らし、データの流れを予測可能にします。

## 4.1 宣言のルール

All const: 変数はすべて const で宣言する。
No var: var は絶対に使用禁止。
Minimal let: let は、関数内での局所的な計算ロジックにおいて、初期化が必要な場合のみ例外的に許可する。基本は .reduce 等で代用するが、reduce の乱用により可読性が低下する場合は、let と for...of の使用を許容する。

## 4.2 型定義 (Type Alias)

Single Source of Truth: 型定義は type キーワードに統一する。
Schema First: 外部入力（API レスポンス等）の型については、Zod スキーマ (Sec 9.2) を正とし、そこから型を自動生成する (`z.infer`) ことを推奨する。
PascalCase: 型名はパスカルケース（例: UserProfile）とする。

```TypeScript
// ✅ Good
type UserProfile = {
  readonly id: string;
  readonly name: string;
};
```

## 4.3 any の完全禁止

ルール: any 型はいかなる理由があっても使用してはならない。
対処法: 型が不明な外部データは unknown とし、準標準ライブラリである Zod (Sec 9.2 参照) を使用して型を確定（Narrowing）させる。

## 4.4 配列定義の統一

ルール: 原則として readonly T[] を使用し、配列自体の変更（push, pop 等）を型レベルで禁止する。
表記: Array<T> ではなく、シンプルに T[] (readonly T[]) を使用する。
例外: 非常に複雑な Union 型配列の場合のみ Array<...> を許容するが、基本は type で別名を付けて T[] にする。

## 4.5 定数セットと Enum の代替 (Constants & Enum Alternatives)

固定された値の集合（定数セット）を扱う場合は、TypeScript 独自の enum ではなく、「Object-as-Enum パターン（as const オブジェクト）」 を標準とします。
ルール: 定数オブジェクトには必ず as const (Const Assertion) を付与し、プロパティを再帰的に readonly かつリテラル型として固定する。
型定義: 値の型が必要な場合は、typeof と keyof を組み合わせて動的に抽出する。手動で Union Type を書くこと（二重管理）を避ける。
推奨パターン:

```TypeScript
// 1. 定数定義: as const でリテラル型に固定
export const AI_MODE = {
  SPEED: 'speed',
  TURBO: 'turbo',
  PRECISE: 'precise',
} as const;
// 2. 型抽出: 値のUnion型を自動生成 ('speed' | 'turbo' | 'precise')
// この構文を「定数セット定義の定型句」として使用する
export type AiMode = (typeof AI_MODE)[keyof typeof AI_MODE];
// 使用例
const currentMode: AiMode = AI_MODE.SPEED;
```

メリット:
Runtime Safety: コンパイル後も単純な JavaScript オブジェクトとして残るため、挙動が予測しやすい。
Source of Truth: オブジェクト（値）を定義するだけで型も自動生成されるため、変更時の修正漏れが起きない。

# 5. 関数と制御フロー (Functions & Control Flow)

「読む人」の脳内メモリを消費させない、フラットなロジック記述を強制します。

## 5.1 アロー関数の統一

ルール: 関数宣言 function は使用せず、すべてアロー関数 const func = () => {} に統一する。
理由: 変数宣言と同じ構文で一貫性を持たせ、this の結合を排除するため。

## 5.2 引数のルール (Named Arguments)

ルール: 引数が 3 つ以上 になる場合、または boolean フラグ を渡す場合は、必ず単一のオブジェクトとして受け取る。
理由: 呼び出し元での可読性を担保するため。

```TypeScript
// ❌ Bad
updateConfig(true, false, 30);

// ✅ Good
updateConfig({ enableLog: true, dryRun: false, timeout: 30 });
```

## 5.3 早期リターン (Early Return) の強制

ルール: else 句の使用を極力避ける。条件を満たさない場合は即座に return し、ネストを浅く保つ（ガード節パターン）。
制限: ネストの深さは原則 2 階層までとする。

## 5.4 純粋関数 (Pure Functions) の推奨

指針: 関数は可能な限り、外部の変数を参照・変更せず、引数のみから戻り値を計算するように設計する。
副作用: DB 操作や API 通信などの副作用を持つ関数は、ファイル名や関数名で明示的に区別する（例: fetchUser は副作用あり、formatUser は純粋）。

# 6. 型システムの運用 (Type System Guidelines)

型の複雑さを競うのではなく、「安全性」と「ドメイン表現」のために型を使います。

## 6.1 Discriminated Unions (判別可能な共用体)

推奨: ステータス管理や分岐ロジックには、必ず「共通のリテラル型プロパティ（タグ）」を持つ Union 型を使用する。
効果: TS が自動的に型を絞り込んでくれるため、キャスト不要で安全に分岐できる。

```TypeScript
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: User };
type ErrorState   = { status: 'error'; error: Error };

type State = LoadingState | SuccessState | ErrorState;

// statusで分岐すると、dataやerrorへのアクセスが型安全になる
const render = (state: State) => {
  if (state.status === 'success') {
    return console.log(state.data); // OK
  }
  // console.log(state.data); // Error: dataプロパティは存在しない可能性がある
};
```

## 6.2 型ガード関数 (User-Defined Type Guards)

ルール: as による型アサーション（キャスト）は原則禁止とする。
代替: is キーワードを用いた型ガード関数、または Zod の .parse() を使用して、ランタイムでも安全性を保証する。

```TypeScript
// ❌ Bad: 嘘をつく可能性がある
const user = data as User;

// ✅ Good: 検証ロジックを通す
const isUser = (data: unknown): data is User => { ... };
if (isUser(data)) {
  // ここでは user として扱える
}
```

## 6.3 ユーティリティ型の活用

推奨: 新しい型を一から作る前に、TS 標準の Pick, Omit, Partial, Record を活用して、既存の型から派生させる。これにより型の重複定義（DRY 違反）を防ぐ。

# 7. 非同期処理とエラーハンドリング (Async & Error Handling)

非同期処理の複雑さと、予期せぬ実行時エラーを制御するためのルールです。

## 7.1 Async/Await の強制

ルール: Promise チェーン（.then(), .catch()）は使用禁止とする。必ず async/await を使用する。
理由: ネストを平坦化し、同期コードと同じ見た目でロジックを記述するため。
例外: Promise.all() などの並列処理ユーティリティを使用する場合のみ、Promise オブジェクトを直接扱うことが許可される。

```TypeScript
// ❌ Bad: コールバック地獄の温床
fetchData().then(data => {
  return process(data);
}).catch(err => { ... });

// ✅ Good: 平坦で分かりやすい
const data = await fetchData();
const result = await process(data);
```

## 7.2 エラー処理の方針 (Result 型アプローチの推奨)

例外（throw）は、制御フローの「大ジャンプ（GOTO）」であり、どこでキャッチされるかが不明瞭になりがちです。本規約では、エラーを「値」として扱う Result 型パターンを推奨します。
ルール: ビジネスロジック内での throw は極力避け、成功か失敗かを表すオブジェクトを返す。
実装: 準標準ライブラリである `neverthrow` を使用する（Sec 9.4 参照）。

```TypeScript
import { ok, err, Result } from 'neverthrow';

const divide = (a: number, b: number): Result<number, Error> => {
  if (b === 0) {
    return err(new Error('Division by zero'));
  }
  return ok(a / b);
};

// 呼び出し側（強制的にエラーチェックが行われる）
const result = divide(10, 0);
if (result.isOk()) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

## 7.3 try-catch の使用範囲

ルール: try-catch は、システム境界（API のエントリーポイント、外部 API 呼び出しの直前など）のみで使用する。
禁止: 関数内部の細かいロジックごとに try-catch を乱立させない。

# 8. ファイル構造と命名規則 (File Structure & Naming)

「どこに何があるか」「それが何であるか」を名前と場所だけで判断できるようにします。

## 8.1 命名規則 (Naming Conventions)

| 対象       | ケース     | 形式/プレフィックス           | 例                             |
| ---------- | ---------- | ----------------------------- | ------------------------------ |
| 変数/定数  | camelCase  | 名詞                          | userData, count                |
| 関数       | camelCase  | 動詞 + 名詞                   | getUser, calculateTotal        |
| 非同期関数 | camelCase  | 動詞 + 名詞 + Async           | fetchUserAsync, saveDataAsync  |
| Boolean    | camelCase  | 助動詞 (is, has, can, should) | isActive, hasPermission        |
| 型 (Type)  | PascalCase | 名詞                          | User, ApiResponse              |
| ファイル名 | kebab-case | 内容を表す名詞                | user-profile.ts, api-client.ts |

特記事項:

- 略語禁止: usr, idx, ctx などの曖昧な略語は禁止。AI や他者が読む際の妨げになるため、user, index, context と完全に記述する。
- 複数形: 配列は必ず複数形 (users) または List 接尾辞 (userList) をつける。

## 8.2 ファイル構成 (File Structure)

1 ファイル 1 モジュール:

- 原則として、1 つのファイルには「主となる 1 つの関数」または「関連する型定義のセット」のみを記述する。
- コロケーション (Colocation): 関連するコードは近くに置く。「機能単位（Feature-based）」のフォルダ構成を推奨する。

```
Plaintextsrc/
  features/
    auth/               # 認証機能に関連するすべて
      types.ts          # 型定義
      auth-api.ts       # API通信ロジック
      auth-utils.ts     # ヘルパー関数
    user/
      ...
  shared/               # 全体で共有するユーティリティ
    utils/
    types/
```

- Barrel File (index.ts) の制限:フォルダごとの再エクスポート（export \* from './user'）を行う index.ts は便利だが、循環参照や Tree Shaking の問題を起こしやすいため、必要最小限にとどめる。可能な限り、具体的なファイルパスから直接インポートすることを推奨する。

# 9. 準標準ライブラリ (Standard Libraries)

本規約に準拠し、効率的かつ安全な開発を行うために、以下のライブラリを標準として採用します。

## 9.1 date-fns (日付操作)

選定理由:

- **完全な関数型**: `date.add(1, 'day')` ではなく、`addDays(date, 1)` のようにデータと関数が分離しており、Sec 1.3 に合致します。
- **不変性 (Immutable)**: 操作結果は常に新しい Date オブジェクトとなり、Sec 1.2 に合致します。
- **Tree-shaking**: 必要な関数のみをバンドルできます。

```TypeScript
import { add, format } from 'date-fns';

const today = new Date();
const nextWeek = add(today, { weeks: 1 }); // 副作用なし
const dateString = format(nextWeek, 'yyyy-MM-dd');
```

## 9.2 Zod (ランタイム型検証)

選定理由:

- **Single Source of Truth**: スキーマ定義から TypeScript の型を自動生成でき、Sec 4.2 を支援します。
- **安全なパース**: `safeParse` メソッドにより、例外ではなく Result 的な扱いが可能です。

```TypeScript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  age: z.number().min(0),
});

type User = z.infer<typeof UserSchema>; // 型定義を自動生成

const result = UserSchema.safeParse(apiResponse);
if (result.success) {
  // result.data は確実に User 型
}
```

## 9.3 ts-pattern (パターンマッチング)

選定理由:

- **宣言的記述**: 命令的な分岐ではなく、式として分岐を記述できます。
- **Exhaustive Check**: `exhaustive()` により、Union 型の全パターン網羅をコンパイル時に強制できます（Sec 3.5 の switch 禁止の強力な代替）。

```TypeScript
import { match } from 'ts-pattern';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

const message = match(state)
  .with({ status: 'loading' }, () => 'Loading...')
  .with({ status: 'success' }, (s) => `Data: ${s.data}`)
  .with({ status: 'error' }, (s) => `Error: ${s.error.message}`)
  .exhaustive();
```

## 9.4 neverthrow (エラーハンドリング)

選定理由:

- **Railway Oriented Programming**: 正常系と異常系を分離し、パイプライン処理を実現します。
- **宣言的かつフラット**: ネストを排除し、処理の流れを明確にします。
- **型安全**: エラー型を Union として追跡可能です。

### 主要ユーティリティ

- **map**: Result が Ok の場合のみ値を変換します（Creation）。
- **andThen**: Result が Ok の場合のみ、次の Result を返す関数を実行します（処理の連鎖）。
- **match**: 最終的に成功・失敗の両方を処理して値を取り出します。
- **fromThrowable**: 例外を投げる関数を Result 型に変換し、try-catch をシステム境界に限定します（Sec 7.3 準拠）。

```TypeScript
import { ok, err, Result } from 'neverthrow';

// 各関数は Result クラスのインスタンスを返す
const parseJson = (str: string): Result<User, Error> => { ... };
const validateUser = (user: User): Result<User, ValidationError> => { ... };
const saveUser = (user: User): Result<string, dbError> => { ... };

const processUser = (jsonString: string) => {
  return parseJson(jsonString)
    .andThen(validateUser) // 成功なら検証へ
    .andThen(saveUser)     // 成功なら保存へ
    .map((id) => `User saved with ID: ${id}`);
};
```
