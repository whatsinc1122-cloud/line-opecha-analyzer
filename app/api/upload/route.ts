import { NextRequest, NextResponse } from 'next/server';
import { saveUpload } from '@/lib/storage';
import { parseLineChat, calculateStats } from '@/lib/parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'ファイルが指定されていません' }, { status: 400 });
    }

    // ファイル内容を読み込み
    const text = await file.text();

    // LINEチャットをパース
    const parsedMessages = parseLineChat(text);

    if (parsedMessages.length === 0) {
      return NextResponse.json({ error: 'メッセージを抽出できませんでした' }, { status: 400 });
    }

    // 統計情報を計算
    const stats = calculateStats(parsedMessages);

    // ファイルに保存
    const upload = saveUpload({
      id: 0, // 自動採番
      filename: file.name,
      uploadDate: new Date().toISOString(),
      totalMessages: stats.totalMessages,
      activeUsers: stats.activeUsers,
      chatMessages: parsedMessages.map((msg, idx) => ({
        id: idx,
        timestamp: msg.timestamp.toISOString(),
        username: msg.username,
        message: msg.message
      }))
    });

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      stats: {
        totalMessages: upload.totalMessages,
        activeUsers: upload.activeUsers,
        messageCount: upload.chatMessages.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'ファイルアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
