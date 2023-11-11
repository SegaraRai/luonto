# Luonto

<img align="center" src="https://github.com/SegaraRai/luonto/assets/29276700/484aa404-b3ea-438c-9166-79bdbe134b65" alt="Luonto Demo" />

[Luonto](https://luonto.null.lu/) は [Nature Remo](https://nature.global/) の非公式 Web アプリケーションです

Nuxt 3 で作成しており、Service Worker 上で SSR を行います (SWSR; Service Worker Side Rendering)  
PWA にも対応しているので、オフラインでも動作します (キャッシュされた情報が見れるだけですが…)

使用にあたっては予め Nature の API アクセストークンを取得しておく必要があります  
[home.nature.global](https://home.nature.global/) から取得してください

API への送信処理はすべてローカルで行われるため、アクセストークンが Nature の API サーバー以外に送信されることはありません  
Luonto をホストしているサーバー (Cloudflare Pages) は静的アセットの配信にのみ使用しています  
万が一アクセストークンが漏洩した場合は、上記リンクからアクセストークンを無効化してください

## 開発方法

以下が必要です

- [Node.js](https://nodejs.org/) v20
- [pnpm](https://pnpm.io/) v8

[Bun](https://bun.sh/) が正式に Windows に対応したら pnpm から移行するかも

### セットアップ

```bash
pnpm install
```

### 開発サーバーの起動

```bash
pnpm run dev
```

`http://localhost:3000` で確認できます

### ビルド

```bash
pnpm run build
```

`.output/public` に静的アセットが出力されます

### プロダクションビルドのプレビュー

```bash
pnpm run preview
```

`http://localhost:3000` でプレビューできます

### デプロイ

`.output/public` を配信すれば OK です (JavaScript の動作するサーバーは必要ありません)  
Cloudflare Pages にデプロイする場合は以下のコマンドを実行してください

```bash
pnpm wrangler pages deploy .output/public
```
