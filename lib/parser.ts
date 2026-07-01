export interface ParsedMessage {
  timestamp: Date;
  username: string;
  message: string;
}

// LINEチャットテキストをパース（複数行メッセージ対応）
export function parseLineChat(text: string): ParsedMessage[] {
  const lines = text.split('\n');
  const messages: ParsedMessage[] = [];

  let currentDate: string | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 日付行の判定（例: "2026/06/22(月)"）
    const dateMatch = line.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (dateMatch) {
      currentDate = dateMatch[0];
      i++;
      continue;
    }

    if (!currentDate) {
      i++;
      continue;
    }

    // メッセージ行の判定（タブで区切られている）
    if (line.includes('\t')) {
      const parts = line.split('\t');

      if (parts.length < 2) {
        i++;
        continue;
      }

      const timeMatch = parts[0].trim().match(/^(\d{2}):(\d{2})$/);
      if (!timeMatch) {
        i++;
        continue;
      }

      const hour = timeMatch[1];
      const min = timeMatch[2];
      const username = parts[1].trim();

      // メッセージ部分（複数タブの場合は結合）
      let messageRaw = parts.slice(2).join('\t').trim();

      // 複数行メッセージの処理
      // 開きの引用符がある場合は、次のメッセージ行か日付行まで読み進める
      if (messageRaw.startsWith('"') && !messageRaw.endsWith('"')) {
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];

          // 次のメッセージ行（タブ + 時刻）またはシステムメッセージまで読み進める
          if (nextLine.match(/^\d{2}:\d{2}\t/) || nextLine.match(/^\d{4}\/\d{2}\/\d{2}/)) {
            i--; // 次のメッセージなので、一つ前に戻す
            break;
          }

          messageRaw += '\n' + nextLine;

          // 閉じの引用符で終わったらここまで
          if (nextLine.endsWith('"')) {
            break;
          }

          i++;
        }
      }

      // 引用符を削除（前後の引用符を削除）
      if (messageRaw.startsWith('"') && messageRaw.endsWith('"')) {
        messageRaw = messageRaw.slice(1, -1).trim();
      }

      // 画像・動画・その他システムメッセージはスキップ
      if (messageRaw.match(/^\[.+\]$/)) {
        i++;
        continue;
      }
      if (!messageRaw.trim()) {
        i++;
        continue;
      }

      try {
        const timestamp = new Date(`${currentDate} ${hour}:${min}:00`);

        messages.push({
          timestamp,
          username,
          message: messageRaw
        });
      } catch (error) {
        // タイムスタンプのパースに失敗した場合はスキップ
      }
    }

    i++;
  }

  return messages;
}

// チャットメッセージの統計を計算
export interface ChatStats {
  totalMessages: number;
  activeUsers: number;
  uniqueUsers: string[];
}

export function calculateStats(messages: ParsedMessage[]): ChatStats {
  const uniqueUsers = new Set(messages.map(m => m.username));

  return {
    totalMessages: messages.length,
    activeUsers: uniqueUsers.size,
    uniqueUsers: Array.from(uniqueUsers).sort()
  };
}

// トピック辞書
export const TOPICS = {
  keratin: {
    name: '縮毛矯正',
    keywords: ['矯正', '縮毛矯正', '還元', 'ストレート', '伸ばし']
  },
  color: {
    name: 'カラー',
    keywords: ['カラー', 'カラーケア', 'ブリーチ', '染める']
  },
  damage: {
    name: 'ダメージケア',
    keywords: ['ダメージ', 'トリートメント', 'ケア', '毛先', 'パヤパヤ']
  },
  seminar: {
    name: 'セミナー・研修',
    keywords: ['セミナー', '講座', 'ワークショップ', '勉強', '学習']
  },
  equipment: {
    name: '機材・薬剤',
    keywords: ['薬剤', 'アイロン', 'ツール', '機材', '商品', 'ツヤでるりん']
  }
};

// メッセージをトピック別に分類
export function classifyTopics(messages: ParsedMessage[]): Record<string, number> {
  const topicCounts: Record<string, number> = {};

  for (const topic in TOPICS) {
    topicCounts[topic] = 0;
  }
  topicCounts['other'] = 0;

  for (const msg of messages) {
    let found = false;

    for (const [topicId, topicInfo] of Object.entries(TOPICS)) {
      if (topicInfo.keywords.some(kw => msg.message.includes(kw))) {
        topicCounts[topicId]++;
        found = true;
        break;
      }
    }

    if (!found) {
      topicCounts['other']++;
    }
  }

  return topicCounts;
}
