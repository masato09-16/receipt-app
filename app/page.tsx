'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">電子レシートアプリ</h1>

      <div className="flex flex-col gap-4">
        <Link
          href="/user"
          className="bg-blue-500 text-white px-6 py-3 rounded text-center hover:bg-blue-600"
        >
          ユーザーとして使う
        </Link>
        <Link
          href="/store"
          className="bg-green-500 text-white px-6 py-3 rounded text-center hover:bg-green-600"
        >
          店舗として使う
        </Link>
      </div>
    </main>
  );
}
