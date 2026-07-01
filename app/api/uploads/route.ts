import { NextResponse } from 'next/server';
import { getAllUploads } from '@/lib/storage';

export async function GET() {
  try {
    const uploads = getAllUploads().map(upload => ({
      id: upload.id,
      filename: upload.filename,
      uploadDate: upload.uploadDate,
      totalMessages: upload.totalMessages,
      activeUsers: upload.activeUsers
    }));

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'アップロード履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
