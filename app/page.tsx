'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Upload {
  id: number;
  filename: string;
  uploadDate: string;
  totalMessages: number;
  activeUsers: number;
}

export default function Home() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/uploads');
      const data = await response.json();
      setUploads(data.uploads || []);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">LINE オプチャ分析ツール</h1>
          <p className="text-gray-600 mt-2">美容師向けオンラインサロンのチャット内容を確認・整理</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Action Buttons */}
        <div className="mb-12">
          <Link
            href="/upload"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            + 新しいチャットをアップロード
          </Link>
        </div>

        {/* Upload History */}
        <section className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">過去のアップロード</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              読み込み中...
            </div>
          ) : uploads.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              まだアップロードされたチャットはありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ファイル名</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">アップロード日時</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">メッセージ数</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">アクティブユーザー</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload) => (
                    <tr key={upload.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{upload.filename}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(upload.uploadDate).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{upload.totalMessages}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{upload.activeUsers}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/viewer/${upload.id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          詳細を見る
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
