import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "시아의 언어공부",
  description: "한국어 단어를 영어·중국어·일본어로 동시에 학습하세요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.className}>
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-indigo-600">시아의 언어공부</Link>
            <Link href="/wordbook" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
              단어장
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
