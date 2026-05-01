// eslint.config.js
// @ts-check

import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/components/ui/**', // shadcn/ui のコンポーネントディレクトリ
      '**/lib/utils.ts', // shadcn/ui でよく使われる utils (cn関数等)
      '**/.next/**', // Next.jsのビルド生成物
      '**/dist/**', // 一般的なビルド生成物
      '**/playwright/**', // PlaywrightのCT用ファイル
      '**/playwright-report/**', // Playwrightのレポート
      '**/test-results/**', // Playwrightのテスト結果
    ],
  },
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      /* ==========================================================
        基本的な禁止事項
         ========================================================== */
      'no-var': 'error', // varの禁止
      'prefer-const': 'error', // 可能な限りconstを強制
      eqeqeq: ['error', 'always'], // 厳密等価演算子 (===) の強制
      'func-style': ['error', 'expression'], // 関数宣言ではなく関数式を強制
      'no-unused-vars': 'off', // TypeScript用のルールを使用するため無効化
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ], // 未使用変数の禁止（_で始まる変数は除外）

      /* ==========================================================
        TypeScript特有のスタイル統一
         ========================================================== */
      // interfaceを禁止し、type aliasに統一
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // anyの完全禁止
      '@typescript-eslint/no-explicit-any': 'error',
      // 配列の定義は Array<T> ではなく T[] に統一（シンプルさ優先）
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      // import時の型のみインポートは type import に統一
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      /* ==========================================================
        【重要】特定構文の強力な制限 (no-restricted-syntax)
         ========================================================== */
      'no-restricted-syntax': [
        'error',
        {
          // クラスの使用禁止
          selector: 'ClassDeclaration',
          message:
            'Classes are not allowed. Use plain objects and functions (Functional approach).',
        },
        {
          // Enumの禁止
          selector: 'TSEnumDeclaration',
          message:
            'Enums are not allowed. Use Union types or Objects with "as const".',
        },
        {
          // Interfaceの禁止（念押し）
          selector: 'TSInterfaceDeclaration',
          message: 'Interfaces are not allowed. Use "type" alias.',
        },
        {
          // namespaceの禁止
          selector: 'TSModuleDeclaration',
          message: 'Namespaces are not allowed. Use ES Modules.',
        },
        {
          // 命令型ループの禁止 (for, while)
          selector:
            'ForStatement, ForInStatement, WhileStatement, DoWhileStatement',
          message:
            'Imperative loops are not allowed. Use array methods (map, filter, reduce) or "for...of".',
        },
        {
          // switch文の禁止
          selector: 'SwitchStatement',
          message:
            'Switch statements are not allowed. Use object mapping or if/else blocks.',
        },
        {
          // delete演算子の禁止（オブジェクトの構造を変えないため）
          selector: 'UnaryExpression[operator="delete"]',
          message:
            'Do not use "delete". It mutates the object shape. Create a new object without the key.',
        },
      ],

      /* ==========================================================
        可読性とシンプルさ
         ========================================================== */
      // ネストの深さを制限（2階層まで）
      'max-depth': ['error', 2],
      // 関数の引数数を制限（3つ以上はオブジェクトで受けるルールを間接的に強制）
      'max-params': ['error', 2],
      // console.logの警告（デバッグコードの混入防止）
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];
