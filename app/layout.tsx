import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LINE チャット分析ツール",
  description: "LINEチャットの内容を確認・整理するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
