'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setFile(e.dataTransfer.files?.[0] || null);
    setError(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      setSuccess(`ファイル「${file.name}」をアップロードしました！`);
      setFile(null);

      setTimeout(() => {
        router.push(`/viewer/${data.uploadId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロード中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1 font-semibold">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📤 チャットをアップロード
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragEnter}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />

            {file ? (
              <>
                <div className="text-6xl mb-4">✅</div>
                <div className="font-semibold text-blue-600 mb-4">ファイルを選択しました</div>
                <div className="bg-blue-100 text-blue-900 px-4 py-3 rounded-lg inline-block font-mono text-sm break-all max-w-md">
                  {file.name}
                </div>
                <div className="text-gray-600 text-sm mt-4">
                  ファイルサイズ: {(file.size / 1024).toFixed(2)} KB
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4 animate-bounce">📁</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ファイルをドラッグ&ドロップ
                </h2>
                <p className="text-gray-600 mb-8">
                  またはクリックして選択してください
                </p>
                <label
                  htmlFor="file-input"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg cursor-pointer transition shadow-lg"
                >
                  ファイルを選択
                </label>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="text-red-700 font-semibold">❌ エラーが発生しました</div>
              <div className="text-red-600 text-sm mt-2">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="text-green-700 font-semibold">✨ {success}</div>
              <div className="text-green-600 text-sm mt-2">2秒後に詳細ページに移動します...</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || loading}
            className={`w-full font-bold py-4 px-6 rounded-lg transition shadow-lg text-lg ${
              file && !loading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                アップロード中...
              </span>
            ) : (
              '🚀 アップロード'
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-12 space-y-6">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span>❓</span> LINEチャットのエクスポート方法
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <div className="font-semibold">LINEアプリを開く</div>
                  <div className="text-sm text-gray-600">確認したいチャットを選択します</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <div className="font-semibold">メニューをタップ</div>
                  <div className="text-sm text-gray-600">ハンバーガーメニュー（⋮）から「トーク設定」を選択</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <div className="font-semibold">「トークを送信」を選択</div>
                  <div className="text-sm text-gray-600">テキスト形式でメールやCloudに保存します</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> アップロードの注意事項
            </h3>
            <ul className="space-y-3 text-gray-700 text-sm">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>テキスト形式（.txt）のファイルをアップロードしてください</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>アップロード後、自動的にチャット内容が分析されます</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>複数回アップロードできます。すべての履歴が保存されます</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
