'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { classifyTopics, TOPICS } from '@/lib/parser';

interface ChatMessage {
  id: number;
  timestamp: string;
  username: string;
  message: string;
}

interface Upload {
  id: number;
  filename: string;
  uploadDate: string;
  totalMessages: number;
  activeUsers: number;
  chatMessages: ChatMessage[];
}

export default function ViewerPage() {
  const params = useParams();
  const uploadId = parseInt(params.uploadId as string);

  const [upload, setUpload] = useState<Upload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchUploadDetails();
  }, [uploadId]);

  const fetchUploadDetails = async () => {
    try {
      const response = await fetch(`/api/viewer/${uploadId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '詳細の取得に失敗しました');
      }

      setUpload(data.upload);

      const topics = classifyTopics(
        data.upload.chatMessages.map((msg: ChatMessage) => ({
          timestamp: new Date(msg.timestamp),
          username: msg.username,
          message: msg.message
        }))
      );
      setTopicCounts(topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !upload) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Link href="/" className="text-blue-100 hover:text-white mb-4 inline-flex items-center gap-1 font-semibold">
              ← ダッシュボードに戻る
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-l-4 border-red-500">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-bold text-lg">{error || 'データが見つかりません'}</p>
          </div>
        </main>
      </div>
    );
  }

  const filteredMessages = filter === 'all'
    ? upload.chatMessages
    : upload.chatMessages.filter(msg =>
        TOPICS[filter as keyof typeof TOPICS]?.keywords.some(kw => msg.message.includes(kw))
      );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white sticky top-0 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/" className="text-blue-100 hover:text-white mb-4 inline-flex items-center gap-1 font-semibold">
            ← ダッシュボードに戻る
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-4xl">📄</div>
            <div>
              <h1 className="text-3xl font-bold">{upload.filename}</h1>
              <p className="text-blue-100 text-sm mt-1">
                📅 {new Date(upload.uploadDate).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-bold mb-2">💬 総メッセージ数</div>
            <div className="text-5xl font-bold text-blue-600 mb-2">{upload.totalMessages}</div>
            <div className="text-gray-500 text-xs">すべてのユーザーの合計</div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-bold mb-2">👥 アクティブユーザー</div>
            <div className="text-5xl font-bold text-green-600 mb-2">{upload.activeUsers}</div>
            <div className="text-gray-500 text-xs">チャットに参加したユーザー</div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="text-gray-600 text-sm font-bold mb-2">🎯 ユニークユーザー</div>
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {Object.keys(new Set(upload.chatMessages.map(m => m.username))).length}
            </div>
            <div className="text-gray-500 text-xs">ユーザー名の種類</div>
          </div>
        </div>

        {/* Topic Summary */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-orange-600 mb-12">
          <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white px-8 py-6">
            <h2 className="text-2xl font-bold">📊 トピック別メッセージ集計</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(TOPICS).map(([key, topic]) => {
                const count = topicCounts[key] || 0;
                const percentage = upload.totalMessages > 0 ? ((count / upload.totalMessages) * 100).toFixed(1) : 0;
                const colors = {
                  keratin: 'from-red-50 to-red-100 border-red-300',
                  color: 'from-yellow-50 to-yellow-100 border-yellow-300',
                  damage: 'from-green-50 to-green-100 border-green-300',
                  seminar: 'from-blue-50 to-blue-100 border-blue-300',
                  equipment: 'from-purple-50 to-purple-100 border-purple-300',
                };
                return (
                  <div
                    key={key}
                    className={`bg-gradient-to-br ${colors[key as keyof typeof colors]} rounded-lg p-5 border-2 hover:shadow-md transition`}
                  >
                    <div className="font-bold text-gray-900 text-sm mb-2">{topic.name}</div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">{count}</div>
                    <div className="text-xs text-gray-700 font-semibold">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-green-600">
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-6 flex justify-between items-center gap-4">
            <h2 className="text-2xl font-bold">💬 チャット内容</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">フィルター:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-900 bg-white hover:bg-gray-50 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
              >
                <option value="all">全て ({upload.chatMessages.length})</option>
                {Object.entries(TOPICS).map(([key, topic]) => (
                  <option key={key} value={key}>
                    {topic.name} ({topicCounts[key] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="px-8 py-5 hover:bg-green-50 transition border-b last:border-0">
                <div className="flex justify-between items-baseline gap-4 mb-3">
                  <div className="font-bold text-white text-sm bg-green-600 px-3 py-1 rounded-full inline-block">
                    {msg.username}
                  </div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {new Date(msg.timestamp).toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-gray-700 break-words whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-3 rounded">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="p-16 text-center bg-gray-50">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-600 font-bold">このトピックのメッセージはありません</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
