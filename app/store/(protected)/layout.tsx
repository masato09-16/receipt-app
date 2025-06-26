'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [storeName, setStoreName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/store/login');
        return;
      }

      const q = query(collection(db, 'stores'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setStoreName(data.store_name || '');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 space-y-4 border-r">
        <h2 className="text-xl font-bold text-gray-700">📍 {storeName || '店舗名'}</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/store" className="text-blue-600 hover:underline">
            🧾 レシート登録
          </Link>
          <Link href="/store/products" className="text-blue-600 hover:underline">
            ⚙️ 事前設定
          </Link>
          <Link href="/store/receipts" className="text-blue-600 hover:underline">
            📄 レシート履歴一覧
          </Link>
          <button
            onClick={async () => {
              await auth.signOut();
              router.push('/store/login');
            }}
            className="text-red-500 hover:underline text-left"
          >
            🚪 ログアウト
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
