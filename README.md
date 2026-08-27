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

## Google Analytics (GA4)

計測 ID は環境変数 `NEXT_PUBLIC_GA_ID` で管理します（コードへのハードコードはしません）。

### ローカル

`.env.local` に以下を設定してください（`.env.local.example` も参照）。

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Vercel（必須・手動設定）

本番 / Preview / Development でも計測するため、[Vercel ダッシュボード](https://vercel.com) の対象プロジェクトで環境変数を追加してください。

1. Project → **Settings** → **Environment Variables**
2. Name: `NEXT_PUBLIC_GA_ID`
3. Value: `G-TD3PHZ3QPD`（実際の測定 ID）
4. Environments: **Production** / **Preview** / **Development** すべてにチェック
5. 保存後、**再デプロイ**（`NEXT_PUBLIC_*` はビルド時に埋め込まれるため）

設定後、GA4 のリアルタイムレポートでページビューが届くことを確認してください。
