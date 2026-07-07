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
  const [totalStats, setTotalStats] = useState({ messages: 0, users: 0 });

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/uploads');
      const data = await response.json();
      const uploadsList = data.uploads || [];
      setUploads(uploadsList);

      if (uploadsList.length > 0) {
        const stats = uploadsList.reduce(
          (acc: any, upload: Upload) => ({
            messages: acc.messages + upload.totalMessages,
            users: acc.users + upload.activeUsers,
          }),
          { messages: 0, users: 0 }
        );
        setTotalStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LINE オプチャ分析ツール
            </h1>
          </div>
          <p className="text-gray-600">美容師向けオンラインサロンのチャット内容を確認・整理します</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* CTA Section */}
        <div className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">新しいチャットをアップロード</h2>
              <p className="text-blue-100">LINEのテキストファイルをアップロードして、チャットを分析します</p>
            </div>
            <Link
              href="/upload"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition shadow-lg whitespace-nowrap"
            >
              ✨ アップロード
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && uploads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
              <div className="text-gray-600 text-sm font-semibold">総メッセージ数</div>
              <div className="text-4xl font-bold text-blue-600 mt-2">{totalStats.messages.toLocaleString()}</div>
              <div className="text-gray-500 text-sm mt-2">{uploads.length}件のアップロード</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
              <div className="text-gray-600 text-sm font-semibold">総アクティブユーザー数</div>
              <div className="text-4xl font-bold text-purple-600 mt-2">{totalStats.users}</div>
              <div className="text-gray-500 text-sm mt-2">複数アップロード内の重複を含む</div>
            </div>
          </div>
        )}

        {/* Upload History Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">📋 アップロード履歴</h2>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">読み込み中...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">チャットがまだアップロードされていません</h3>
              <p className="text-gray-600 mb-6">上のボタンからLINEチャットのテキストファイルをアップロードしてください</p>
              <Link
                href="/upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                今すぐアップロード
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ファイル名</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">アップロード日時</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        💬 メッセージ数
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        👥 ユーザー
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uploads.map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{upload.filename}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {upload.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(upload.uploadDate).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {upload.totalMessages}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {upload.activeUsers}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/viewer/${upload.id}`}
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                        >
                          👁️ 詳細を見る
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
