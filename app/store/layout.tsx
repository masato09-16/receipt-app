// app/store/layout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow p-4 flex gap-4">
        <Link href="/store" className="text-blue-600 hover:underline">
          🧾 レシート登録
        </Link>
        <Link href="/store/register" className="text-blue-600 hover:underline">
          🏬 店舗登録
        </Link>
        <Link href="/store/products" className="text-blue-600 hover:underline">
          🛒 商品管理
        </Link>
      </nav>

      {/* 各ページのコンテンツ */}
      <main className="p-6">{children}</main>
    </div>
  );
}
