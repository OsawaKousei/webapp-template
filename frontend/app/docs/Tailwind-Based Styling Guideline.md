## **Tailwind-Based Styling Guideline**

**Subtitle: Design System & UI Component Standards**

### **1\. 概要と目的 (Overview & Objective)**

本規約は、Widget-Oriented React Guideline における **L1: Pure Views** の実装詳細を補完し、デザインシステムの一貫性と保守性を担保するための標準を定義します。

#### **1.1 解決する課題**

- **Inconsistency:** 開発者ごとの「色」「余白」「サイズ」の恣意的な決定（マジックナンバー）を排除します。
- **CSS Conflicts:** グローバルスコープ汚染や詳細度（Specificity）の戦いを、Utility-First アプローチによって根絶します。
- **Type Safety:** スタイル定義（クラス名）とロジック（Props）の結合を、型安全なユーティリティを用いて厳格に管理します。

### **2\. 技術スタック (Tech Stack)**

既存の規約（Strict TS, Functional）に適合するライブラリ群を選定します。

| Category           | Tool               | Strategy / Policy                                                       |
| :----------------- | :----------------- | :---------------------------------------------------------------------- |
| **Styling Engine** | **Tailwind CSS**   | ビルド時に生成されるAtomic CSS。実行時オーバーヘッドゼロ。              |
| **UI Primitives**  | **Base UI**        | Headless UI（見た目を持たず機能のみ提供）。アクセシビリティ標準準拠。   |
| **Component Lib**  | **shadcn/ui**      | Tailwind CSS + Base UI を組み合わせた「コピー可能な」コンポーネント集。 |
| **Variant Mgmt**   | **cva**            | Propsに基づいてクラス名を生成する関数型ライブラリ。                     |
| **Iconography**    | **Lucide React**   | 軽量で一貫性のあるSVGアイコンセット。                                   |
| **Class Merge**    | **tailwind-merge** | Tailwindクラスの衝突を論理的に解決する（clsx と併用）。                 |

### **3\. ディレクトリ構造とコンポーネント配置**

Widget-Oriented Guideline の構造に対し、UI部品（Primitives）の配置場所を明確化します。

```Plaintext

src/
├── components/
│ └── ui/ \# \[Shared L1\] shadcn/ui コンポーネント (Button, Input, etc.)
│ ├── button.tsx
│ ├── input.tsx
│ └── ...
├── lib/
│ └── utils.ts \# cn() ユーティリティ (clsx \+ tailwind-merge)
└── index.css \# Tailwind Directives & CSS Variables (Theme Definition)
```

### **4\. 実装ルール (Implementation Rules)**

#### **4.1 Strict Tailwind Usage**

Tailwind の自由度を制限し、デザインシステムへの準拠を強制します。

- **Arbitrary Values 禁止:** w-\[123px\] や bg-\[\#ff0000\] のような角括弧記法（Arbitrary values）を原則禁止します。必ず tailwind.config.js で定義されたトークン（w-32, bg-destructive 等）を使用してください。
- **Utility Sorting:** prettier-plugin-tailwindcss の導入を必須とし、クラス名の並び順を自動統一します。人間が順序を考える時間を排除します。

#### **4.2 CVA (Class Variance Authority) Pattern**

コンポーネントの見た目の変化（Variant）は、条件分岐（if/else）や三項演算子でクラス名を結合するのではなく、**CVA** を用いて宣言的に定義します。

Good Example (Button.tsx):  
BasicGuideline の制約（interface禁止, readonly）を適用し、shadcn/ui のデフォルトコードを以下のように修正して使用します。

```TypeScript

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 1\. スタイルの定義 (Single Source of Truth)
const buttonVariants \= cva(
 // Base styles
 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
 {
 // Variants definitions
 variants: {
 variant: {
 default: 'bg-primary text-primary-foreground hover:bg-primary/90',
 destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
 outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
 ghost: 'hover:bg-accent hover:text-accent-foreground',
 },
 size: {
 default: 'h-10 px-4 py-2',
 sm: 'h-9 rounded-md px-3',
 lg: 'h-11 rounded-md px-8',
 },
 },
 defaultVariants: {
 variant: 'default',
 size: 'default',
 },
 }
);

// 2\. 型定義 (BasicGuideline準拠: type & readonly)
// interface は禁止。React.HTMLAttributes を継承しつつ、CVAから型を抽出。
type ButtonProps \= React.ButtonHTMLAttributes\<HTMLButtonElement\> &
 Readonly\<VariantProps\<typeof buttonVariants\>\> & {
 readonly asChild?: boolean;
 };

// 3\. コンポーネント実装
const Button \= React.forwardRef\<HTMLButtonElement, ButtonProps\>(
 ({ className, variant, size, ...props }, ref) \=\> {
 return (
 \<button
 className\={cn(buttonVariants({ variant, size, className }))}
 ref\={ref}
 {...props}
 /\>
 );
 }
);
Button.displayName \= 'Button';

export { Button, buttonVariants };
```

#### **4.3 shadcn/ui 運用プロトコル (Operational Protocol)**

**Vendor Isolation (外部コードの隔離)** `src/components/ui/` ディレクトリは、`shadcn/ui` 自動生成コードの管理領域（Vendor Code）と定義します。

1. **Strict Rulesの適用除外:** このディレクトリ配下に限り、`BasicGuideline` の構文制約（`interface` 禁止、`readonly` 強制など）の適用を免除します。ESLint の `overrides` 設定により、これを自動的に許可します。
2. **変更の最小化:** 生成されたコードは原則としてそのまま使用し、カスタマイズ（配色の変更など）は `tailwind.config.ts` や `index.css` での制御を優先します。
3. **手動修正の禁止:** コンポーネントのアップデートを容易にするため、ロジックの修正や手動での型書き換えは極力行わないでください。機能不足がある場合は、`Wrapper Component` を作成して対応します。
4. **依存先の一貫性:** 新規に追加する `shadcn/ui` コンポーネントは、プロジェクト方針に従い `Base UI` バックエンドを前提に生成・更新してください。既存コンポーネントの依存先（Base UI / Radix UI）を混在させないことを原則とします。

#### **4.4 Base UI バックエンド運用ルール**

- **Backend 固定:** `shadcn` CLI の初期化・追加時は、常に Base UI をバックエンドとして扱います。チーム内で同じ設定を再現できるよう、CLIオプションや設定ファイルを統一してください。
- **Import 境界の明確化:** `src/components/ui/` は Vendor Code とし、アプリケーション層（features/widgets）は Base UI の低レベルPrimitiveを直接 import しません。必ず `src/components/ui/` 経由で利用します。
- **アップデート戦略:** UI更新は「shadcn再生成 -> 差分確認 -> Wrapper側で吸収」を優先し、Vendor Code 内での独自改修を最小化します。

### **5\. テーマ設計とトークン (Theming & Tokens)**

ハードコードされた色（Hex/RGB）の使用を禁止し、**Semantic Tokens（意味的命名）** を徹底します。これにより、ダークモード対応やテーマ変更を容易にします。

#### **5.1 CSS Variables (index.css)**

色は tailwind.config.ts で直接定義せず、CSS変数として定義し、Tailwindから参照します。

```CSS

@layer base {
 :root {
 /\* ❌ Bad: 色の名前 (具体的な見た目) \*/
 \--blue-500: 59 130 246;

    /\* ✅ Good: 役割の名前 (抽象的な意味) \*/
    \--primary: 222.2 47.4% 11.2%;
    \--primary-foreground: 210 40% 98%;

    \--muted: 210 40% 96.1%;
    \--muted-foreground: 215.4 16.3% 46.9%;

}

.dark {
 \--primary: 210 40% 98%;
 \--primary-foreground: 222.2 47.4% 11.2%;
 /\* ダークモード時は自動的に反転 \*/
 }
}
```

#### **5.2 意味的命名の基準**

コンポーネント開発時は、以下のセマンティッククラスのみを使用します。

- **Background:** bg-background, bg-muted (背景)
- **Foreground (Text):** text-foreground, text-muted-foreground (文字色)
- **Border:** border-input, border-border (枠線)
- **Status:** bg-destructive, text-destructive-foreground (危険・エラー)
- **Accent:** bg-accent, text-accent-foreground (ホバー、選択状態)

### **6\. レイアウトと空白 (Layout & Spacing)**

Widget-Oriented Guideline の **L3: Layouts** 層におけるスタイリングルールです。

- **Layout Components:** 複雑な配置（Grid, Flex）を行う場合は、その責務のみを持つ Layout コンポーネントを作成します。Widget の内部に w-1/2 などのレイアウト依存のスタイルを記述してはいけません（親コンポーネントの責務であるため）。
- **Stack Pattern:** 要素間の余白には margin を個別に設定するのではなく、親要素での flex gap-x, space-y-x の使用を推奨します。これにより、要素の入れ替えや削除時のレイアウト崩れを防ぎます。

### **7\. アニメーション (Animation)**

- **Micro Interactions:** ホバーやフォーカスなどの単純な変化には、Tailwind の transition-all duration-200 等のユーティリティを使用します。
- **Complex Animations:** マウント/アンマウント時の遷移や複雑なシーケンスには、**Framer Motion** の使用を許可します。ただし、BasicGuideline の「宣言的記述」に従い、アニメーション定義は定数として分離してください。

### **8\. 例外運用 (Exceptions)**

- **Complex Selectors:** &:nth-child(2) のような複雑なCSSセレクタが必要な場合、TailwindのArbitrary Variants (\[&\>li\]:mt-2) は可読性を損なうため、過度な使用を避けます。あまりに複雑になる場合は、そのコンポーネント専用の \*.module.css の作成を許可しますが、これは最終手段とします。
