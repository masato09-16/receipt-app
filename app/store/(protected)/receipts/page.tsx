'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function StoreReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [storeEmail, setStoreEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/store/login');
        return;
      }
      setStoreEmail(user.email ?? '');
      const q = query(collection(db, 'receipts'), where('store_email', '==', user.email));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceipts(data);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">🧾 レシート履歴一覧</h1>

      {receipts.length === 0 ? (
        <p>まだ発行されたレシートがありません。</p>
      ) : (
        <div className="space-y-6">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="bg-white rounded-xl shadow p-4 border">
              <div className="text-gray-800 font-semibold mb-2">📅 {receipt.date}</div>
              <div className="text-sm text-gray-600">👤 購入者: {receipt.user_email}</div>
              <div className="text-sm text-gray-600">💳 支払方法: {receipt.payment_method}</div>
              <div className="text-sm text-gray-600">💰 合計: ¥{receipt.total}</div>
              <div className="text-sm text-gray-600">🔢 レジ: {receipt.register_no} / 担当者: {receipt.staff}</div>

              <details className="mt-3">
                <summary className="cursor-pointer text-blue-600 text-sm">🛍️ 商品明細を表示</summary>
                <ul className="mt-2 space-y-1 text-sm">
                  {receipt.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>¥{item.price}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
