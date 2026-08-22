# phone-case-compare

スマホケースを比較する Next.js アプリケーションです。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint

## ディレクトリ構成

```
src/
├── app/          # ルーティング (App Router)
├── components/   # UI コンポーネント
├── lib/          # Supabase クライアントなどのユーティリティ
└── types/        # 型定義 (Phone, Case など)
```

## セットアップ

```bash
npm install
```

## 開発サーバー

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## その他のコマンド

```bash
npm run build   # 本番ビルド
npm run start   # 本番サーバー起動
npm run lint    # ESLint 実行
```
