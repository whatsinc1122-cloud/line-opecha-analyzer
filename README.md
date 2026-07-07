# LINE オプチャ分析ツール

美容師向けオンラインサロン（ECET×ツヤでるりん）のLINEチャット内容を確認・整理するための簡易分析ツール。

## 🎯 プロジェクト概要

- **用途**: 社内用チャット分析ツール（LINEオプチャ）
- **対象**: 美容師向けオンラインサロン
- **主な機能**: チャット分析、統計表示、トピック分類

## 📱 本番URL

```
https://line-opecha-analyzer.vercel.app
```

## 🚀 主な機能

### 1. チャットアップロード
- LINEチャットをテキスト形式（.txt）でアップロード
- 自動解析と統計情報の計算
- 複数回のアップロードに対応

### 2. 統計表示
- **総メッセージ数**: すべてのアップロードメッセージの合計
- **総アクティブユーザー数**: チャットに参加したユーザー数
- **ユニークユーザー**: 異なるユーザー名の種類

### 3. トピック分類（キーワードベース）
```
- 縮毛矯正: 矯正、縮毛矯正、還元、ストレート、伸ばし
- カラー: カラー、カラーケア、ブリーチ、染める
- ダメージケア: ダメージ、トリートメント、ケア、毛先、パヤパヤ
- セミナー・研修: セミナー、講座、ワークショップ、勉強、学習
- 機材・薬剤: 薬剤、アイロン、ツール、機材、商品、ツヤでるりん
```

### 4. チャット内容の表示
- テーブル形式でメッセージを表示
- ユーザー名、時刻、メッセージを明確に区別
- トピックでフィルター機能

## 🛠️ 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| **フロント** | Next.js + React + Tailwind CSS | 14.0.0 / 18.2.0 |
| **バック** | Next.js API Routes | 14.0.0 |
| **ストレージ** | JSON ファイル (.data ディレクトリ) | - |
| **ホスティング** | Vercel | - |
| **ソース管理** | GitHub | whatsinc1122-cloud/line-opecha-analyzer |

## 📁 ディレクトリ構造

```
line-opecha-analyzer/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホームページ（ダッシュボード）
│   ├── upload/
│   │   └── page.tsx        # アップロードページ
│   ├── viewer/[uploadId]/
│   │   └── page.tsx        # チャット詳細ビューアページ
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts    # POST /api/upload
│   │   ├── uploads/
│   │   │   └── route.ts    # GET /api/uploads
│   │   └── viewer/[uploadId]/
│   │       └── route.ts    # GET /api/viewer/[uploadId]
│   └── globals.css         # グローバルスタイル
│
├── lib/
│   ├── parser.ts           # LINEテキストパーサー
│   ├── storage.ts          # JSON ファイルストレージ
│   └── types.ts            # TypeScript 型定義
│
├── .data/                  # JSON ファイル保存先（自動生成）
│   ├── index.json          # アップロードIDカウンター
│   └── upload-{id}.json    # 各アップロードデータ
│
├── public/                 # 静的ファイル
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json            # Vercel デプロイ設定
├── railway.json           # Railway デプロイ設定（参考用）
└── README.md              # このファイル
```

## 🔧 セットアップ & 実行

### ローカル開発

```bash
# リポジトリクローン
git clone https://github.com/whatsinc1122-cloud/line-opecha-analyzer.git
cd line-opecha-analyzer

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで開く
open http://localhost:3000
```

### プロダクション ビルド

```bash
# ビルド
npm run build

# 本番実行
npm start
```

## 🚀 デプロイ

### Vercel へのデプロイ

```bash
# Vercel CLI でログイン
vercel login

# 本番デプロイ
vercel --prod
```

### GitHub との連携デプロイ
1. https://vercel.com/new にアクセス
2. GitHub リポジトリを選択
3. 自動デプロイが有効化されます

## 📊 API エンドポイント

### POST /api/upload
ファイルをアップロードして解析

**リクエスト:**
```
Content-Type: multipart/form-data
file: (TXT ファイル)
```

**レスポンス:**
```json
{
  "success": true,
  "uploadId": 1,
  "stats": {
    "totalMessages": 95,
    "activeUsers": 12,
    "uniqueUsers": ["user1", "user2", ...]
  }
}
```

### GET /api/uploads
すべてのアップロード履歴を取得

**レスポンス:**
```json
{
  "uploads": [
    {
      "id": 1,
      "filename": "test_chat.txt",
      "uploadDate": "2026-07-01T17:39:06Z",
      "totalMessages": 95,
      "activeUsers": 12
    }
  ]
}
```

### GET /api/viewer/[uploadId]
特定のアップロード詳細を取得

**レスポンス:**
```json
{
  "upload": {
    "id": 1,
    "filename": "test_chat.txt",
    "uploadDate": "2026-07-01T17:39:06Z",
    "totalMessages": 95,
    "activeUsers": 12,
    "chatMessages": [
      {
        "timestamp": "2026-06-22T10:30:00Z",
        "username": "user1",
        "message": "こんにちは"
      }
    ]
  }
}
```

## 🔄 LINEチャット エクスポート方法

1. **LINEアプリを開く** → 確認したいチャットを選択
2. **メニュー（⋮）をタップ** → 「トーク設定」を選択
3. **「トークを送信」を選択** → テキスト形式でメールやクラウドに保存
4. **ダウンロード** → このアプリにアップロード

## 📝 LINEテキスト形式

期待されるフォーマット:

```
2026/06/22(木)
10:30	ユーザー1	メッセージ内容
10:31	ユーザー2	複数行メッセージの場合は
"引用符で囲まれます"
10:32	ユーザー3	次のメッセージ
```

**対応機能:**
- 日付行の自動検出（`YYYY/MM/DD`）
- タイムスタンプの自動検出（`HH:MM`）
- 複数行メッセージ（引用符で囲まれたもの）
- 画像・動画などのシステムメッセージはスキップ

## 🎨 UI/UX 特徴

- **色分けされたUI**: 各セクションに明確な色を設定
- **ボタンの枠線**: 2px のボーダーで明確に識別可能
- **ダッシュボード**: 統計情報をカードで表示
- **テーブル**: メッセージ数やユーザー数をカラフルなバッジで表示
- **セクション区分**: 上部に太いカラーライン（border-t-4）で視覚的に区分
- **レスポンシブ対応**: モバイル・タブレット・デスクトップに対応

## 🐛 既知の制限事項

- 認証機能なし（社内用のため）
- テーブルのスクロール制限（max-height: 600px）
- トピック分類はキーワードマッチングのみ（機械学習なし）
- JSON ファイル保存（サーバーの再起動でデータ保持）

## 🔍 トラブルシューティング

### ビルドエラー: "next.config.ts is not supported"
→ `next.config.ts` を `next.config.js` に変更してください

### ビルドエラー: "Unknown font Geist"
→ `app/layout.tsx` からフォントインポートを削除してください

### Vercel デプロイエラー: "Node.js version mismatch"
→ `package.json` で Node.js バージョンを確認してください（>=18.0.0 推奨）

## 📞 参考リンク

- **GitHub**: https://github.com/whatsinc1122-cloud/line-opecha-analyzer
- **Vercel**: https://vercel.com/whats-3adbbd5d
- **本番環境**: https://line-opecha-analyzer.vercel.app

---

**最終更新**: 2026-07-07
