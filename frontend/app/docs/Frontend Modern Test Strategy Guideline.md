# **Frontend Modern Test Strategy Guideline**

**Subtitle: Balancing Quality and Maintenance Cost in Widget-Oriented Architecture**

## **1\. 基本方針 (Core Philosophy)**

本テスト戦略は、テストの「作成コスト」「維持コスト」「実行速度」と、得られる「安心感（品質担保）」のトレードオフを最適化します。

* **実装の詳細をテストしない:** 内部のStateやDOMの構造（\<div\>のクラス名など）に依存したテストは書かず、ユーザー視点の振る舞い（「ボタンをクリックするとローディングが表示されるか」等）をテストします。  
* **Widget（Integration）テストに投資する:** 単体（L1 Component）のテストは最低限に留め、ビジネスロジックとUIが結合する「L2 Widget」層のテストを最重要視します。  
* **E2Eは「クリティカルパス」のみ:** PlaywrightによるE2Eテストは強力ですが、実行時間が長く壊れやすいため、決済やログインなどの最重要フローに限定します。

## **2\. テスト階層と責務 (Test Layers & Tools)**

添付ガイドラインで指定されたツール（Vitest, Playwright）を活用し、各層で以下のように責務を分割します。

| 階層 (Layer) | ツール | 投資割合 | ターゲット | コスト |
| :---- | :---- | :---- | :---- | :---- |
| **1\. Static Analysis** | TypeScript / ESLint | **最大** | 型整合性、規約違反の検知  | 極小 |
| **2\. Unit Test** | Vitest | 小 | 複雑な計算ロジック、カスタムフック | 小 |
| **3\. Widget Test** | Vitest \+ RTL \+ MSW | **大 (主力)** | **L2 Widgets** (API通信や状態変化を伴うUI) | 中 |
| **4\. E2E / VRT** | Playwright | 中 | ルーティング、主要なユースケース、視覚的バグ  | 大 |

*(RTL \= React Testing Library, MSW \= Mock Service Worker)*

## **3\. 対象別のテスト実装ガイドライン (Implementation Guide)**

### **3.1 Shared Utils / Hooks (Unit Test)**

純粋な関数や、ドメインロジックをカプセル化したカスタムフックが対象です。

* **方針:** 入出力が明確なため、境界値やエッジケースを含めて手厚くテストします。  
* **ツール:** vitest run

### **3.2 L1 Components (UI Elements)**

ボタン、入力フォーム、カードなど、状態を持たない（Statelessな）純粋な見た目のコンポーネントです。

* **方針:** **原則としてVitestでのテストは書きません。** DOMの存在確認だけのテストは保守コストを上げるだけです。  
* **代替手段:** PlaywrightによるVRT（Visual Regression Test）や、Storybookを利用した視覚的確認に留めます。

### **3.3 L2 Widgets (Integration Test \- 主力層)**

APIからデータを取得し、L1 Componentを組み合わせて機能を提供するドメイン層です。

* **方針:** 本ガイドラインにおける**最重要テスト対象**です。ユーザーがそのWidgetをどう操作し、どう画面が変化するか（Loading状態、エラー状態、データ表示状態）をテストします。  
* **環境構築の要件 (MSWの導入):** バックエンドAPIのモックには MSW (Mock Service Worker) を使用します。これにより、コンポーネント内の fetch や axios などの実装をモック化せず、ネットワークレベルでリクエストを傍受してレスポンスを返すため、本番環境とほぼ同じ動作をテストできます。  
* **ツール:** vitest run \+ React Testing Library \+ MSW

### **3.4 L3 Layouts / Routes (E2E Test)**

URLとWidgetの紐付けを行う Integration Layer です。

* **方針:** 実際のブラウザを立ち上げ、ページ遷移や全体のデータフローが繋がっているかを確認します。  
* **対象:** 「ログイン \-\> 一覧画面遷移 \-\> 詳細確認 \-\> ログアウト」といった、ユーザーの主要なハッピールート（正常系フロー）のみに絞ります。網羅性は求めません。  
* **ツール:** playwright test

## **4\. テスト環境構築・維持のコスト削減戦略**

テスト環境の維持コスト（負債化）を防ぐため、以下のルールを徹底します。

1. **データ生成ファクトリの導入:**  
   テストデータ（APIのモックレスポンス等）はベタ書きせず、テストデータ生成ライブラリ（例: fishery や自作のファクトリ関数）を使用します。APIスキーマ変更時の修正箇所を1箇所に集約するためです。  
2. **data-testid の活用:**  
   テストからDOM要素を検索する際、テキスト内容やCSSクラス名に依存すると、デザイン変更（文言修正など）でテストが壊れます。機能的に重要な要素には data-testid を付与し、テストからはそれを参照します。