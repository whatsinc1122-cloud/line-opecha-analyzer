const fs = require('fs');
const path = require('path');

// テストファイルを読み込み
const testFile = '/tmp/test_chat.txt';
const fileContent = fs.readFileSync(testFile, 'utf-8');

// 簡易的なパーサーテスト
const lines = fileContent.split('\n');
let currentDate = null;
let messageCount = 0;

for (const line of lines) {
  const dateMatch = line.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (dateMatch) {
    currentDate = dateMatch[0];
  }

  if (currentDate && line.includes('\t')) {
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const timeMatch = parts[0].trim().match(/^(\d{2}):(\d{2})$/);
      if (timeMatch) {
        const username = parts[1].trim();
        const messageRaw = parts.slice(2).join('\t').trim();

        if (messageRaw && !messageRaw.match(/^\[.+\]$/)) {
          messageCount++;
          if (messageCount <= 3) {
            console.log(`[${currentDate} ${parts[0]}] ${username}: ${messageRaw.substring(0, 50)}...`);
          }
        }
      }
    }
  }
}

console.log(`\n合計: ${messageCount} メッセージが抽出されました`);
