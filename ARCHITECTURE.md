# アーキテクチャ設計書

LINE オプチャ分析ツールの技術アーキテクチャと実装詳細。

## 📐 全体構成

```
┌─────────────────────────────────────┐
│     Vercel (本番環境)                 │
│  https://line-opecha-analyzer.vercel.app
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Next.js 14.0.0 (フロント + バック)  │
├─────────────────────────────────────┤
│ Pages:                               │
│  - / (ダッシュボード)                │
│  - /upload (アップロード)            │
│  - /viewer/[uploadId] (詳細表示)     │
│                                      │
│ API Routes:                          │
│  - POST /api/upload                 │
│  - GET /api/uploads                 │
│  - GET /api/viewer/[uploadId]       │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  JSON File Storage (.data/)          │
│  - index.json (IDカウンター)         │
│  - upload-{id}.json (チャットデータ) │
└─────────────────────────────────────┘
```

## 🔄 データフロー

### 1. アップロード処理

```
[ユーザー] 
  ↓
[ファイル選択 (drag & drop)]
  ↓
[POST /api/upload]
  ├→ parseLineChat()        # lib/parser.ts
  │   ├ テキストを行単位で分割
  │   ├ 日付行を検出（YYYY/MM/DD）
  │   ├ 時刻・ユーザー名を抽出
  │   └ 複数行メッセージを結合
  │
  ├→ calculateStats()       # lib/parser.ts
  │   ├ メッセージ総数
  │   ├ アクティブユーザー数
  │   └ ユニークユーザーリスト
  │
  ├→ classifyTopics()       # lib/parser.ts
  │   └ キーワードマッチングでトピック分類
  │
  └→ saveUpload()          # lib/storage.ts
      ├ .data/index.json を更新
      └ .data/upload-{id}.json を作成
        ↓
[詳細ページにリダイレクト]
  ↓
[チャット内容を表示]
```

### 2. 閲覧処理

```
[ユーザー]
  ↓
[GET /api/uploads]
  ├→ getAllUploads()       # lib/storage.ts
  │   └ .data/index.json を読み込む
  │
  └→ ダッシュボードに一覧表示
      ↓
[GET /api/viewer/[uploadId]]
  ├→ getUpload(uploadId)    # lib/storage.ts
  │   └ .data/upload-{id}.json を読み込む
  │
  └→ チャットメッセージを表示
```

## 📁 コアモジュール詳細

### lib/parser.ts

**主な関数:**

```typescript
// LINEテキストをパース
parseLineChat(text: string): ParsedMessage[]
  - 入力: LINEチャットテキスト（改行区切り）
  - 出力: ParsedMessage[] {timestamp, username, message}
  - 処理:
    * 日付行検出 (/\d{4}\/\d{2}\/\d{2}/)
    * タイムスタンプ抽出 (/^\d{2}:\d{2}$/)
    * 複数行メッセージ結合（引用符で囲まれたもの）
    * システムメッセージをスキップ

// 統計計算
calculateStats(messages: ParsedMessage[]): ChatStats
  - 入力: ParsedMessage[]
  - 出力: {totalMessages, activeUsers, uniqueUsers}

// トピック分類
classifyTopics(messages: ParsedMessage[]): Record<string, number>
  - 入力: ParsedMessage[]
  - 出力: {keratin: count, color: count, ...}
  - 方法: キーワードマッチング（最初にマッチしたトピックを使用）

// トピック辞書
TOPICS: {
  keratin: {name: '縮毛矯正', keywords: [...]},
  color: {name: 'カラー', keywords: [...]},
  damage: {name: 'ダメージケア', keywords: [...]},
  seminar: {name: 'セミナー・研修', keywords: [...]},
  equipment: {name: '機材・薬剤', keywords: [...]}
}
```

**複数行メッセージの処理:**

```
入力テキスト:
10:31	ユーザー2	複数行メッセージの場合は
"引用符で囲まれます"
10:32	ユーザー3	次のメッセージ

パース処理:
1. 開きの引用符（"）を検出
2. 次のメッセージ行（タブ + 時刻）または日付行まで読み込む
3. 行を改行コード（\n）で結合
4. 前後の引用符を削除

出力:
{timestamp, username: 'ユーザー2', message: '複数行メッセージの場合は\n引用符で囲まれます'}
```

### lib/storage.ts

**主な関数:**

```typescript
// ファイルベースストレージ（.data/ ディレクトリ使用）

saveUpload(filename, chatMessages, stats): {id, success}
  - .data/index.json に新しい ID を登録
  - .data/upload-{id}.json にデータを保存

getAllUploads(): Upload[]
  - .data/index.json から全アップロードを読み込む
  - 新しい順（降順）でソート

getUpload(uploadId): Upload | null
  - .data/upload-{uploadId}.json を読み込む
```

**ファイル構造:**

```
.data/
├── index.json (登録済みアップロード一覧)
│   {
│     "nextId": 2,
│     "uploads": [
│       {"id": 1, "filename": "test_chat.txt", "uploadDate": "...", "totalMessages": 95, "activeUsers": 12}
│     ]
│   }
│
└── upload-1.json (アップロード詳細)
    {
      "id": 1,
      "filename": "test_chat.txt",
      "uploadDate": "2026-07-01T17:39:06Z",
      "totalMessages": 95,
      "activeUsers": 12,
      "chatMessages": [
        {"id": 1, "timestamp": "2026-06-22T10:30:00Z", "username": "user1", "message": "..."},
        ...
      ]
    }
```

## 🔌 API エンドポイント詳細

### POST /api/upload

```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest): Promise<NextResponse>

処理フロー:
1. multipart/form-data からファイル取得
2. テキスト読み込み (UTF-8)
3. parseLineChat() でメッセージ抽出
4. calculateStats() で統計計算
5. classifyTopics() でトピック分類
6. saveUpload() でファイル保存
7. JSON レスポンスを返却

エラーハンドリング:
- ファイル読み込み失敗 → 400 Bad Request
- パース失敗 → 400 Bad Request
- ストレージ保存失敗 → 500 Internal Server Error
```

### GET /api/uploads

```typescript
// app/api/uploads/route.ts
export async function GET(): Promise<NextResponse>

処理:
1. getAllUploads() を呼び出し
2. ID、ファイル名、統計情報のみ抽出
3. JSON 配列で返却

レスポンス形式:
{
  "uploads": [
    {
      "id": number,
      "filename": string,
      "uploadDate": string (ISO 8601),
      "totalMessages": number,
      "activeUsers": number
    }
  ]
}
```

### GET /api/viewer/[uploadId]

```typescript
// app/api/viewer/[uploadId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
): Promise<NextResponse>

処理:
1. params.uploadId をパース（数値に変換）
2. getUpload(uploadId) を呼び出し
3. メッセージをタイムスタンプでソート
4. JSON で返却

レスポンス形式:
{
  "upload": {
    "id": number,
    "filename": string,
    "uploadDate": string,
    "totalMessages": number,
    "activeUsers": number,
    "chatMessages": [
      {
        "id": number,
        "timestamp": string (ISO 8601),
        "username": string,
        "message": string
      }
    ]
  }
}

エラー:
- 無効な uploadId → 400 Bad Request
- アップロード見つからない → 404 Not Found
```

## 🎨 フロントエンド構成

### ページ構成

| ページ | ファイル | 説明 |
|--------|---------|------|
| ダッシュボード | `app/page.tsx` | アップロード一覧、統計表示 |
| アップロード | `app/upload/page.tsx` | ファイル選択、ドラッグ&ドロップ |
| 詳細表示 | `app/viewer/[uploadId]/page.tsx` | チャットメッセージ、トピック分類 |

### 色分けスキーム

```
Header: 青 (bg-gradient-to-r from-blue-600 to-blue-800)
CTA: 青系 (bg-blue-50 to bg-blue-100)
アップロード履歴: 青 (border-t-4 border-blue-600)
トピック集計: オレンジ (border-t-4 border-orange-600)
チャット内容: 緑 (border-t-4 border-green-600)

バッジ:
- メッセージ数: 青 (bg-blue-100 border-blue-300)
- ユーザー数: 紫 (bg-purple-100 border-purple-300)
- ユーザー名: 背景に応じて色分け
```

### ステート管理

```typescript
// app/page.tsx (ダッシュボード)
const [uploads, setUploads] = useState<Upload[]>([])
const [loading, setLoading] = useState(true)
const [totalStats, setTotalStats] = useState({messages: 0, users: 0})

useEffect(() => {
  fetchUploads()  // GET /api/uploads
}, [])

// app/viewer/[uploadId]/page.tsx (詳細表示)
const [upload, setUpload] = useState<Upload | null>(null)
const [loading, setLoading] = useState(true)
const [topicCounts, setTopicCounts] = useState<Record<string, number>>({})
const [filter, setFilter] = useState<string>('all')  // フィルター対象トピック

useEffect(() => {
  fetchUploadDetails()  // GET /api/viewer/[uploadId]
}, [uploadId])
```

## 🚀 デプロイ設定

### Vercel (本番環境)

**設定ファイル: `vercel.json`**
```json
{
  "services": {
    "web": {
      "root": ".",
      "framework": "nextjs"
    }
  },
  "rewrites": [...]
}
```

**特徴:**
- GitHub との自動連携デプロイ
- 各コミットで自動ビルド＆デプロイ
- エラーログは Vercel ダッシュボードで確認可能

### ローカル開発サーバー

```bash
npm run dev
# http://localhost:3000
# ホットリロード有効
```

## ⚠️ 既知の制限事項

### データ永続性
- JSON ファイルベース保存のため、サーバーメモリに依存しない
- ただし、`.data/` ディレクトリがサーバーのファイルシステムに存在する必要がある
- Vercel デプロイでは各デプロイ間でファイルが持続しない可能性あり

**解決策:** 本番運用では、PostgreSQL または Amazon S3 などの外部ストレージへの移行を検討

### パフォーマンス
- 大規模テキストファイル（>10MB）のパースが遅い可能性
- テーブルスクロール制限（max-height: 600px）

### トピック分類
- キーワードマッチングのみ（機械学習なし）
- 複数トピック該当の場合は最初のトピックを選択

## 🔐 セキュリティ

### 認証
- なし（社内用ツールのため）
- 本番環境では IP 制限や Basic Auth 導入を検討

### HTTPS
- Vercel で自動的に HTTPS 対応
- ブラウザ通信は暗号化される

### ファイルアップロード
- `.txt` ファイルのみ受け入れ（`accept=".txt"`）
- サーバー側でファイルタイプの検証なし
- 本番環境では MIME タイプ検証を追加推奨

## 🧪 テスト戦略

### 手動テスト完了項目
✅ ローカルビルド（npm run build）
✅ ローカル開発サーバー（npm run dev）
✅ テストチャットファイルのアップロード（95 メッセージ）
✅ メッセージのパース（複数行メッセージ対応）
✅ API エンドポイント（curl テスト）
✅ Vercel デプロイ＆本番動作確認

### 推奨される今後のテスト
- [ ] ユーザー入力値のバリデーションテスト
- [ ] 大規模ファイルのパフォーマンステスト
- [ ] クロスブラウザ テスト
- [ ] モバイルレスポンシブ テスト
- [ ] E2E テスト（Playwright、Cypress）
- [ ] ユニットテスト（parser.ts、storage.ts）

---

**最終更新**: 2026-07-07
