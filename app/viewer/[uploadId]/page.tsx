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

      // トピック分類
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !upload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← 戻る
            </Link>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-red-600 font-semibold">{error || 'データが見つかりません'}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{upload.filename}</h1>
          <p className="text-gray-600 mt-2">
            アップロード: {new Date(upload.uploadDate).toLocaleString('ja-JP')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{upload.totalMessages}</div>
            <div className="text-gray-600 text-sm mt-2">総メッセージ数</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{upload.activeUsers}</div>
            <div className="text-gray-600 text-sm mt-2">アクティブユーザー数</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">
              {Object.keys(new Set(upload.chatMessages.map(m => m.username))).length}
            </div>
            <div className="text-gray-600 text-sm mt-2">ユニークユーザー</div>
          </div>
        </div>

        {/* Topic Summary */}
        <section className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">トピック集計</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(TOPICS).map(([key, topic]) => (
                <div key={key} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="text-2xl font-bold text-blue-600">{topicCounts[key] || 0}</div>
                  <div className="text-gray-700 font-semibold text-sm mt-1">{topic.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chat Messages */}
        <section className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">チャット内容</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">すべて ({upload.chatMessages.length})</option>
              {Object.entries(TOPICS).map(([key, topic]) => (
                <option key={key} value={key}>
                  {topic.name} ({topicCounts[key] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-gray-900">{msg.username}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
                <div className="text-gray-700 break-words whitespace-pre-wrap">{msg.message}</div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              このトピックのメッセージはありません
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
