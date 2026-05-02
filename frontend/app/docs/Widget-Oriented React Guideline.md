# **Widget-Oriented React Guideline**

**Subtitle: UI Architecture Standards for Complex GUI Applications**

## **1\. 概要と目的 (Overview & Objective)**

本規約は、BasicGuideline.md（言語レベルの制約）を継承し、IDE、管理画面、ダッシュボード等の\*\*「状態依存性が高く、DOM数が多い複雑なGUIアプリケーション」\*\*を構築するための標準を定義します。

### **1.1 解決する課題**

- **Performance:** 頻繁な状態更新による再レンダリングの巻き添え（ラグ）を防ぎます。

- **Scalability:** 機能追加による「Pageコンポーネントの肥大化」と「Propsバケツリレー（Prop Drilling）地獄」を防ぎます。

- **Maintainability:** UI（見た目）と Logic（振る舞い）の境界を物理的に強制し、変更の影響範囲を局所化します。

### **1.2 適用範囲**

- **対象:** 高度なインタラクションを持つアプリケーション（IDE, SaaS Product）。

- **対象外:** LP、ブログ、静的コーポレートサイト。

## ---

**2\. アーキテクチャ定義 (Architecture Definition)**

本規約の核となる\*\*「3層構造（Widget-Oriented）」\*\*を採用します。各コンポーネントは以下のいずれかのレイヤーに明確に分類されなければなりません。

| Layer  | 名称           | 定義・役割                                                                                   | 許可される依存                | 状態管理の責務                                           |
| :----- | :------------- | :------------------------------------------------------------------------------------------- | :---------------------------- | :------------------------------------------------------- |
| **L3** | **Layouts**    | **配置 (Placement)** Widgetを画面上のどこに置くかを定義するグリッド・枠組。                  | Widget, Pure View             | **なし**                                                 |
| **L2** | **Widgets**    | **統合 (Integration)** 特定の機能ドメインを完結させる結合層。Storeと接続しActionを発行する。 | Store, API, Pure View         | **Global Store, Server State** (Zustand, TanStack Query) |
| **L1** | **Pure Views** | **描画 (Rendering)** PropsをJSXに変換する純粋関数。DOMとStyleを持つ唯一の場所。              | **Props のみ** (外部依存禁止) | **UI State** (useState) ※開閉などの一時状態のみ          |

## ---

**3\. ディレクトリ構造とモジュール境界 (Directory & Boundaries)**

Feature-Sliced Design (FSD) の思想を取り入れ、機能単位の構造を規定します。

### **3.1 Feature-based Structure**

Plaintext

src/  
 features/  
 file-explorer/ \# Feature Domain \[cite: 23\]  
 components/ \# L1: Pure Views (非公開) \[cite: 23\]  
 widgets/ \# L2: Widgets (公開API) \[cite: 23\]  
 stores/ \# State & Logic \[cite: 23\]  
 api/ \# Data Fetching \[cite: 23\]  
 index.ts \# Public Interface (Barrel) \[cite: 23\]

### **3.2 Public API Rule (カプセル化)**

- 他の Feature から import して良いのは widgets/ と stores/ (Action用) のみとします。

- components/ (Pure Views) は Feature 外からの参照を禁止します。

## ---

**4\. コンポーネント実装詳細 (Component Implementation)**

各レイヤーのコードの書き方を厳格に定めます。ここでは BasicGuideline.md の構文ルール（Class禁止、Enum禁止など）も適用されます。

### **4.1 L1: Pure Views (The Primitives)**

DOMとStyleを持つことができる唯一のレイヤーです。

- **Props設計:**
  - すべて readonly とします。
  - interface は禁止し、type を利用します。
  - コールバック命名は onEventName に統一します。

- **Logic禁止:**
  - useEffect は禁止します。
  - 条件分岐は ts-pattern またはガード節のみとし、switch は使用しません。
  - データの加工は行わず、受け取ったデータをそのまま表示します。
- **No Premature Optimization:**
  - **原則:** `React.memo` の使用は**原則禁止**とします。
  - **理由:** 現代のReactは十分に高速であり、不要なメモ化はコードの記述量を増やし、可読性を下げる（Simple is Best 違反）ため。また、誤ったメモ化（依存配列の不備や、毎回新しい参照のProps渡し）によるバグを防ぐため。
  - **例外:** 実際にUIのラグが観測され、React Profiler 等で「再レンダリングがボトルネックである」と特定された場合に限り、局所的な最適化として `React.memo` の導入を許可します。

TypeScript

// ✅ Good: Pure View Example (Simplified)  
import { match } from 'ts-pattern';

type Props \= {  
 readonly status: 'loading' | 'success';  
 readonly onRetry: () \=\> void;  
};

// memo でラップせず、直接関数コンポーネントとして定義  
export const StatusBadge \= ({ status, onRetry }: Props) \=\> (  
 \<div onClick\={onRetry}\>  
 {match(status)  
 .with('loading', () \=\> '⏳ Loading...')  
 .with('success', () \=\> '✅ Success')  
 .exhaustive()}  
 \</div\>  
);

### **4.2 L2: Widgets (The Connectors)**

StoreとPure Viewを接続する層です。

- **役割限定:**
  - Storeからのデータ Select (useStore(selector))。

  - Pure View への Props 供給。

  - **スタイリング禁止:** レイアウト以外の装飾（色、フォント等）は記述しません。

- **Render-as-you-fetch:** データ取得中は \<Suspense\> または Skeleton を表示する責務を持ちます。

### **4.3 L3: Layouts (The Skeleton)**

- **Prop Drilling禁止:** Layout 経由で Widget にデータを渡すことを禁止します。Widget は自律的に Store からデータを取得してください。

## ---

**5\. 状態管理とデータフロー (State & Data Flow)**

アプリケーションの状態を「Server State」と「Client State」に分離し、それぞれの特性に最適化されたライブラリを強制使用します。

### **5.1 Server State: TanStack Query**

**Purpose:** APIレスポンスのキャッシュ、同期、再取得管理。

- Rule 1: No useEffect Fetching  
  コンポーネント内での useEffect \+ fetch は厳禁とします。必ずカスタムフック (useQuery, useMutation) を介してデータにアクセスすること。
- Rule 2: Isolation  
  Query Keyの管理やFetcher関数は api/ ディレクトリ内のカスタムフックに隠蔽し、コンポーネントで直接 useQuery を定義しない。

TypeScript

// ✅ Good: api/useFileQuery.ts  
export const useFileQuery \= (id: string) \=\> {  
 return useQuery({  
 queryKey: \['file', id\],  
 queryFn: () \=\> fetchFile(id),  
 });  
};

### **5.2 Client State: Zustand**

**Purpose:** アプリケーション全体のUI状態（パネル開閉、選択中のアイテム）、およびWidget間の通信。

- Rule 1: Store per Feature  
  巨大な単一Storeを作らず、機能ドメインごとにStoreを分割する（例: useIDEStore, useTerminalStore）。
- Rule 2: Action Co-location  
  状態を変更するロジック（Reducer相当）は、必ずStore内のActionとして定義する。コンポーネント側で setState のようなロジックを組んではならない。
- Rule 3: Selector Pattern  
  再レンダリングを防ぐため、WidgetがStoreを購読する際は、必ずSelector関数を使用して必要な値だけを取り出すこと。

TypeScript

// ✅ Good: stores/useIDEStore.ts  
interface IDEState {  
 readonly activePanel: string | null;  
 readonly actions: {  
 readonly togglePanel: (panel: string) \=\> void;  
 };  
}  
// Consuming in Widget  
const activePanel \= useIDEStore((s) \=\> s.activePanel); // Selector  
const { togglePanel } \= useIDEStore((s) \=\> s.actions);

### **5.3 Local UI State: useState**

**Purpose:** コンポーネントを閉じれば消えて良い一時的な状態（アコーディオンの開閉、未送信のフォーム入力）。

- **Rule:** ビジネスロジックに関わるデータや、他のWidgetと共有すべきデータを useState で管理してはなりません。

## ---

## **6\. テスト戦略 (Testing Strategy)**

「何をテストするか」の責任分界点を明確化し、各レイヤーの目的に最適なツールを選定します。ローカル環境での完結性と実行速度を重視します。

### **6.1 L1: Pure Views (Visual Integrity)**

Tool: Playwright Component Testing (CT)

Purpose: 実際のブラウザレンダリングによる「見た目の正しさ」の保証。

What to Test:

Visual Regression: await expect(component).toHaveScreenshot() を使用し、意図しないデザイン崩れを機械的に検知する。

Development: 開発中は Playwright の UI Mode (--ui) を「カタログ（Storybookの代替）」として使用し、表示確認を行う。

Note: ロジックのテストは行わず、Propsを受け取って正しく表示されることのみを確認する。

### **7.2 L2: Widgets (Behavior & Wiring)**

Tool: Vitest \+ React Testing Library (JSDOM環境)

Purpose: Store や API との「接続（配線）」の正しさの保証。

What to Test:

Interaction: ユーザー操作（クリック等）に対し、適切な Store Action が発火すること。

Conditional Rendering: isLoading, isError 等のステータスに応じ、適切な L1 コンポーネント（Skeleton, ErrorView）に切り替わること。

Note: vi.mock() を活用して外部依存（APIフック、Store）をモックし、Widget 単体の振る舞いを高速に検証する。見た目（CSS）のテストは行わない。

### **7.3 Logic & Stores (Unit Logic)**

Tool: Vitest

Purpose: ビジネスロジックと状態管理の正しさの保証。

What to Test:

Pure Functions: 入力に対する出力の正当性。

Store Actions: Action実行後のStateの変化（Reducer的挙動）。

Note: UIコンポーネントはマウントせず、純粋なTypeScriptのテストとして実行する。

## ---

**7\. 特記事項・例外運用 (Exceptions)**

- **DOMアクセス:** フォーカス制御やスクロール同期など、IDE開発に必須なDOM操作に限り、L1レイヤーでの useRef \+ useEffect を許可します。

- **パフォーマンス:** useCallback, useMemo は「迷ったらやる」の方針を採用します。

## ---

**8\. 基本原則 (Inherited from BasicGuideline)**

本規約は以下の言語レベルの制約を継承しています。

- **Immutable by Default:** let 禁止、readonly 配列の使用。
- **Functional Style:** Class 禁止、純粋関数の推奨。
- **Strict Syntax:**
  - enum 禁止 → Object-as-Enum パターン (as const)。
  - interface 禁止 → type 使用。
  - switch 禁止 → ts-pattern 使用。
  - Loops (for, while) 禁止 → 配列メソッド (map, reduce)。
- **Error Handling:** throw 禁止 → neverthrow (Result型) の使用。
- **Type Safety:** any の完全禁止、zod による実行時検証。
