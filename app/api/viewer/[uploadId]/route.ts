import { NextRequest, NextResponse } from 'next/server';
import { getUpload } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId: uploadIdStr } = await params;
    const uploadId = parseInt(uploadIdStr);

    if (isNaN(uploadId)) {
      return NextResponse.json(
        { error: '無効なアップロードIDです' },
        { status: 400 }
      );
    }

    const upload = getUpload(uploadId);

    if (!upload) {
      return NextResponse.json(
        { error: 'アップロード情報が見つかりません' },
        { status: 404 }
      );
    }

    // チャットメッセージをタイムスタンプでソート
    const sortedMessages = [...upload.chatMessages].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return NextResponse.json({
      upload: {
        ...upload,
        chatMessages: sortedMessages
      }
    });
  } catch (error) {
    console.error('Error fetching viewer data:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
