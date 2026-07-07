# Claude Code ワークフロー & ガイド

このファイルは Claude Code での開発を効率化するためのガイドです。

## 📋 プロジェクト情報

**プロジェクト名**: LINE オプチャ分析ツール  
**所有者**: whatsinc1122-cloud  
**GitHub リポジトリ**: https://github.com/whatsinc1122-cloud/line-opecha-analyzer  
**本番 URL**: https://line-opecha-analyzer.vercel.app  
**ホスティング**: Vercel  
**スタック**: Next.js 14 + React 18 + Tailwind CSS  

## 🚀 よく使うコマンド

### 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド確認
npm run build

# ESLint チェック
npm run lint
```

### デプロイ

```bash
# 本番デプロイ（Vercel）
vercel --prod

# プレビューデプロイ
vercel

# Vercel ログイン（初回のみ）
vercel login
```

### ファイル確認

```bash
# .data ディレクトリ確認（アップロード済みチャット）
ls -la .data/

# 最新のアップロードデータを確認
cat .data/upload-1.json | jq

# ローカル開発用テストファイル確認
ls -la ./test/
```

## 📝 開発フロー

### 1. 新機能追加

**例: チャット検索機能の追加**

```bash
# 1. 現在のブランチ確認
git status

# 2. 開発ブランチ作成
git checkout -b feature/search-chat

# 3. コード編集（lib/parser.ts、app/viewer/[uploadId]/page.tsx など）

# 4. ローカルテスト
npm run dev
# http://localhost:3000 で動作確認

# 5. ビルド確認
npm run build

# 6. コミット
git add -A
git commit -m "Add chat search feature to viewer page"

# 7. プッシュ
git push origin feature/search-chat

# 8. PR 作成（GitHub Web UI）
```

### 2. バグ修正

```bash
# 1. バグ報告から対象コードをロケート
# 例: app/page.tsx:50-60 にバグがある

# 2. コード確認
cat app/page.tsx | head -60

# 3. 修正
# Edit tool または nano でコード修正

# 4. ビルド確認
npm run build

# 5. コミット
git add -A
git commit -m "Fix UI color contrast issue on dashboard"

# 6. デプロイ
vercel --prod
```

### 3. UI 改善

```bash
# 1. 対象ページを確認
# 例: app/page.tsx（ホームページ）

# 2. Tailwind CSS クラスを追加/修正
# 色分けなど視覚的な改善

# 3. ローカルで確認
npm run dev
# ブラウザで http://localhost:3000 にアクセス

# 4. デプロイ
git add -A
git commit -m "Improve dashboard UI with better color scheme"
git push
vercel --prod
```

## 🏗️ ディレクトリ別のガイド

### `app/page.tsx` - ホームページ（ダッシュボード）
- **責務**: アップロード一覧、統計情報表示
- **修正時の確認項目**:
  - 統計計算の正確性
  - テーブルレイアウト（モバイル対応）
  - ボタンの色分け

### `app/upload/page.tsx` - アップロードページ
- **責務**: ファイル選択、ドラッグ&ドロップ
- **修正時の確認項目**:
  - ファイル選択のUI
  - ドラッグ&ドロップのアニメーション
  - エラーメッセージの表示

### `app/viewer/[uploadId]/page.tsx` - 詳細ビューア
- **責責**: チャットメッセージ表示、トピック分類
- **修正時の確認項目**:
  - トピック分類の正確性
  - フィルター機能
  - 大量メッセージのスクロール

### `lib/parser.ts` - LINEテキストパーサー
- **責務**: テキスト解析、統計計算
- **修正時の確認項目**:
  - 複数行メッセージの処理
  - 日付フォーマットの検出
  - トピック分類ロジック
- **テスト方法**:
  ```bash
  # テスト用チャットファイルでアップロード
  curl -F "file=@test_chat.txt" http://localhost:3000/api/upload
  ```

### `lib/storage.ts` - ファイルストレージ
- **責務**: JSON ファイル保存・読み込み
- **修正時の確認項目**:
  - `.data/index.json` の整合性
  - アップロード ID の採番ロジック
  - エラーハンドリング

### `app/api/upload/route.ts` - アップロード API
- **責務**: ファイル受信、解析、保存
- **修正時の確認項目**:
  - マルチパートフォームデータの処理
  - エラーレスポンス
  - 返却データの形式

## 🎨 UI/UX ガイドライン

### 色使い
- **ヘッダー**: 青系（`from-blue-600 to-blue-800`）
- **セクション分け**:
  - 📋 アップロード履歴: 青（`border-t-4 border-blue-600`）
  - 📊 トピック集計: オレンジ（`border-t-4 border-orange-600`）
  - 💬 チャット内容: 緑（`border-t-4 border-green-600`）
- **ボタン**: 枠線 2px（`border-2`）で明確に識別可能
- **バッジ**: 
  - メッセージ数: 青（`bg-blue-100 border-blue-300`）
  - ユーザー数: 紫（`bg-purple-100 border-purple-300`）

### レイアウト
- **モバイル優先**: `md:` ブレークポイント使用
- **グリッド**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **余白**: `px-6 py-8` 標準

### テキスト
- **見出し**: 大きく、太く（`text-2xl font-bold`）
- **説明文**: グレー（`text-gray-600`）
- **重要情報**: 色付きバッジで強調

## 🔍 デバッグ方法

### ブラウザコンソール

```javascript
// API エンドポイントテスト
fetch('/api/uploads')
  .then(r => r.json())
  .then(d => console.log(d))

// 最新のアップロード詳細取得
fetch('/api/viewer/1')
  .then(r => r.json())
  .then(d => console.log(d))
```

### ローカルログ確認

```bash
# 開発サーバーのコンソール出力を確認
npm run dev

# エラーが出ている場合、ターミナル上のスタックトレースを確認
# 例: "Error: Cannot find module '@/lib/parser'"
```

### ファイルシステム確認

```bash
# .data ディレクトリの内容確認
ls -la .data/

# JSON ファイルを読みやすく表示
cat .data/upload-1.json | jq '.'

# index.json で登録済みアップロードを確認
cat .data/index.json | jq '.'
```

## 🔄 よくある修正パターン

### パターン 1: UI 色変更

```bash
# 1. 対象ページのクラス名を確認
grep -n "bg-blue-600" app/page.tsx

# 2. 色を変更
# 例: bg-blue-600 → bg-green-600

# 3. ホバー時の色も変更
# hover:bg-blue-700 → hover:bg-green-700

# 4. デプロイ
npm run build && vercel --prod
```

### パターン 2: トピック追加

```typescript
// lib/parser.ts の TOPICS を修正

export const TOPICS = {
  keratin: {...},
  color: {...},
  // 新規追加
  trend: {
    name: 'トレンド',
    keywords: ['流行', 'バズ', 'インスタ映え', '話題']
  }
}
```

### パターン 3: API レスポンス変更

```typescript
// app/api/upload/route.ts を修正

const response = {
  success: true,
  uploadId: upload.id,
  stats: {...},
  // 新規フィールド追加
  parseTime: parseTimeMs  // パース処理時間（ミリ秒）
}
```

## 📊 パフォーマンス

### 計測方法

```bash
# ビルド時間計測
npm run build
# "Trace" や "Finalizing" の時間をチェック

# ページロード時間
# ブラウザのデベロッパーツール → Network タブで確認
```

### 最適化ポイント
- 大規模テキストファイル（>5MB）のパース時間が増加
- テーブル行数が多い場合（>10000 行）、スクロール遅延の可能性
- 本番環境では .data ディレクトリのサイズ監視推奨

## 🚨 トラブルシューティング

### ビルド失敗

```bash
# Node.js バージョン確認（18 以上必要）
node --version

# npm キャッシュをクリア
npm cache clean --force

# node_modules を削除してインストール
rm -rf node_modules
npm install

# ビルド再試行
npm run build
```

### Vercel デプロイ失敗

```bash
# ローカルでビルド成功を確認
npm run build

# ビルド成功なら、Vercel ダッシュボードでログ確認
# https://vercel.com/whats-3adbbd5d/line-opecha-analyzer
```

### `.data` ディレクトリ関連のエラー

```bash
# .data ディレクトリが存在しない場合、手動作成
mkdir -p .data

# index.json の初期化
echo '{"nextId": 1, "uploads": []}' > .data/index.json
```

## 📚 関連ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 技術詳細
- [package.json](./package.json) - 依存パッケージ
- [GitHub Issues](https://github.com/whatsinc1122-cloud/line-opecha-analyzer/issues) - バグ報告

## ✅ チェックリスト

### 新機能追加時

- [ ] ローカル開発サーバーで動作確認（npm run dev）
- [ ] ビルド成功確認（npm run build）
- [ ] GitHub にプッシュ
- [ ] Vercel へのデプロイ成功確認
- [ ] 本番環境（https://line-opecha-analyzer.vercel.app）で動作確認

### バグ修正時

- [ ] バグの原因を特定
- [ ] 修正コードがターゲット（エラーの正確な行）
- [ ] ローカルビルド成功
- [ ] 修正が他の機能に影響しないか確認
- [ ] Vercel へのデプロイ

### デプロイ前

- [ ] `npm run build` 成功
- [ ] `npm run lint` でエラーなし（警告は許容）
- [ ] コミットメッセージは明確
- [ ] GitHub にプッシュ済み

---

**最終更新**: 2026-07-07
