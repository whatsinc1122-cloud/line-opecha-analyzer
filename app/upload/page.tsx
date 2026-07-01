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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(e.dataTransfer.files?.[0] || null);
    setError(null);
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

      // 2秒後に詳細ページにリダイレクト
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">チャットをアップロード</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition"
            >
              <div className="text-5xl mb-4">📁</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                ファイルをドラッグ&ドロップ
              </h2>
              <p className="text-gray-600 mb-6">
                またはクリックして選択してください
              </p>

              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded cursor-pointer transition"
              >
                ファイルを選択
              </label>

              {file && (
                <p className="mt-4 text-gray-700 font-semibold">
                  選択ファイル: {file.name}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                ✓ {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || loading}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {loading ? 'アップロード中...' : 'アップロード'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-900 mb-2">📋 アップロード方法</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• LINEチャットをテキスト形式で保存したファイルをアップロードしてください</li>
              <li>• ファイル形式: .txt（テキストファイル）</li>
              <li>• アップロード後、チャット内容を確認・分析できます</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
