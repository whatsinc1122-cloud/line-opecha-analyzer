import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

interface Upload {
  id: number;
  filename: string;
  uploadDate: string;
  totalMessages: number;
  activeUsers: number;
  chatMessages: ChatMessage[];
}

interface ChatMessage {
  id: number;
  timestamp: string;
  username: string;
  message: string;
}

// データディレクトリを確認・作成
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 最新の ID を取得
function getNextId(): number {
  ensureDataDir();
  const indexFile = path.join(DATA_DIR, 'index.json');

  if (fs.existsSync(indexFile)) {
    const data = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
    return data.nextId || 1;
  }

  return 1;
}

// ID を保存
function saveNextId(id: number) {
  const indexFile = path.join(DATA_DIR, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify({ nextId: id + 1 }), 'utf-8');
}

// アップロードを保存
export function saveUpload(upload: Upload): Upload {
  ensureDataDir();

  const id = getNextId();
  const uploadData = { ...upload, id };

  const filePath = path.join(DATA_DIR, `upload-${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(uploadData, null, 2), 'utf-8');

  saveNextId(id);

  return uploadData;
}

// すべてのアップロードを取得
export function getAllUploads(): Upload[] {
  ensureDataDir();

  const files = fs.readdirSync(DATA_DIR);
  const uploads: Upload[] = [];

  for (const file of files) {
    if (file.startsWith('upload-') && file.endsWith('.json')) {
      const filePath = path.join(DATA_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      uploads.push(data);
    }
  }

  // 新しい順にソート
  uploads.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  return uploads;
}

// 特定のアップロードを取得
export function getUpload(id: number): Upload | null {
  ensureDataDir();

  const filePath = path.join(DATA_DIR, `upload-${id}.json`);

  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data;
  }

  return null;
}
