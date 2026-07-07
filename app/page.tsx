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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-xl">
                💬
              </div>
              <div>
                <h1 className="text-3xl font-bold">LINE オプチャ分析ツール</h1>
                <p className="text-blue-100 text-sm mt-1">美容師向けオンラインサロンのチャット分析</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* CTA Section */}
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">📤 新しいチャットをアップロード</h2>
              <p className="text-blue-800">LINEのテキストファイルをアップロードして、チャットを分析します</p>
            </div>
            <Link
              href="/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg whitespace-nowrap border-2 border-blue-600"
            >
              ✨ アップロード
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && uploads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
              <div className="text-gray-600 text-sm font-bold mb-2">💬 総メッセージ数</div>
              <div className="text-5xl font-bold text-blue-600 mb-2">{totalStats.messages.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">{uploads.length}件のアップロード</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-purple-500 hover:shadow-lg transition">
              <div className="text-gray-600 text-sm font-bold mb-2">👥 総アクティブユーザー数</div>
              <div className="text-5xl font-bold text-purple-600 mb-2">{totalStats.users}</div>
              <div className="text-gray-500 text-sm">複数アップロード内の重複を含む</div>
            </div>
          </div>
        )}

        {/* Upload History Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-blue-600">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-6">
            <h2 className="text-2xl font-bold">📋 アップロード履歴</h2>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4 font-semibold">読み込み中...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="p-16 text-center bg-gray-50">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">チャットがまだアップロードされていません</h3>
              <p className="text-gray-600 mb-6">上のボタンからLINEチャットのテキストファイルをアップロードしてください</p>
              <Link
                href="/upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition border-2 border-blue-600"
              >
                今すぐアップロード
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">ファイル名</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">アップロード日時</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      💬 メッセージ数
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      👥 ユーザー
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uploads.map((upload) => (
                    <tr key={upload.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{upload.filename}</div>
                        <div className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-1 rounded">
                          ID: {upload.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(upload.uploadDate).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-sm border-2 border-blue-300">
                          {upload.totalMessages}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold text-sm border-2 border-purple-300">
                          {upload.activeUsers}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/viewer/${upload.id}`}
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition text-sm border-2 border-blue-600"
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
