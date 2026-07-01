const fs = require('fs');

// テストファイル読み込み
const testFile = '/tmp/test_chat.txt';
const fileContent = fs.readFileSync(testFile, 'utf-8');

// パーサーロジック（lib/parser.ts を JS で再現）
function parseLineChat(text) {
  const lines = text.split('\n');
  const messages = [];
  let currentDate = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 日付行の判定
    const dateMatch = line.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (dateMatch) {
      currentDate = dateMatch[0];
      continue;
    }

    if (!currentDate) continue;

    // メッセージ行の判定
    if (line.includes('\t')) {
      const parts = line.split('\t');
      if (parts.length < 2) continue;

      const timeMatch = parts[0].trim().match(/^(\d{2}):(\d{2})$/);
      if (!timeMatch) continue;

      const hour = timeMatch[1];
      const min = timeMatch[2];
      const username = parts[1].trim();

      let messageRaw = parts.slice(2).join('\t').trim();

      // 引用符削除
      if (messageRaw.startsWith('"') && messageRaw.endsWith('"')) {
        messageRaw = messageRaw.slice(1, -1);
      }

      // システムメッセージスキップ
      if (messageRaw.match(/^\[.+\]$/)) continue;
      if (!messageRaw.trim()) continue;

      try {
        const timestamp = new Date(`${currentDate} ${hour}:${min}:00`);
        messages.push({
          timestamp,
          username,
          message: messageRaw
        });
      } catch (error) {
        continue;
      }
    }
  }

  return messages;
}

// パフォーマンステスト
console.time('Parse Time');
const messages = parseLineChat(fileContent);
console.timeEnd('Parse Time');

console.log(`\n✓ メッセージ数: ${messages.length}`);
console.log(`✓ ユニークユーザー: ${new Set(messages.map(m => m.username)).size}`);

// 複数行メッセージのサンプル表示
console.log('\n--- 複数行メッセージの例 ---');
const multilineMsg = messages.find(m => m.message.length > 100);
if (multilineMsg) {
  console.log(`ユーザー: ${multilineMsg.username}`);
  console.log(`メッセージ (最初の 100 文字): ${multilineMsg.message.substring(0, 100)}...`);
  console.log(`メッセージ長: ${multilineMsg.message.length} 文字`);
}

// 最初の 5 メッセージ表示
console.log('\n--- 最初の 5 メッセージ ---');
messages.slice(0, 5).forEach((msg, i) => {
  console.log(`${i + 1}. [${msg.timestamp.toLocaleString('ja-JP')}] ${msg.username}: ${msg.message.substring(0, 40)}...`);
});
