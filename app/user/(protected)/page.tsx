'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import '../../globals.css';

export default function UserHomePage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/user/login');
        return;
      }
      setUserEmail(user.email ?? '');
      const q = query(collection(db, 'receipts'), where('user_email', '==', user.email));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceipts(data);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/user/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <aside className="flex justify-between items-center mb-6">
        <span className="text-gray-700 font-medium">📧 {userEmail}</span>
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          ログアウト
        </button>
      </aside>

      <h1 className="text-2xl font-bold mb-4">📄 電子レシート一覧</h1>

      {receipts.length === 0 ? (
        <p>レシートが見つかりませんでした。</p>
      ) : (
        // ← ここから space-y-6 を確実に適用
        <div className="space-y-6">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
            >
              <div className="text-lg font-semibold text-gray-800 mb-1">📍 {receipt.store_name}</div>
              <div className="text-sm text-gray-500 mb-2">🏠 {receipt.store_address}</div>
              <div className="text-sm text-gray-500">📅 {receipt.date}</div>
              <div className="text-sm text-gray-500 mb-4">👤 {receipt.user_email}</div>

              <hr className="my-3" />

              <div className="text-gray-700 font-medium mb-2">🛍️ 商品明細</div>
              <ul className="mb-4 space-y-1">
                {receipt.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>¥{item.price}</span>
                  </li>
                ))}
              </ul>

              <hr className="my-3" />

              <div className="text-sm text-gray-700 mb-1">🧾 小計: ¥{receipt.subtotal}</div>
              <div className="text-sm text-gray-700 mb-1">💸 消費税: ¥{receipt.tax}</div>
              <div className="text-lg font-bold text-right text-blue-800 mb-3">合計: ¥{receipt.total}</div>

              <div className="text-sm text-gray-700 mb-1">💳 支払方法: {receipt.payment_method}</div>
              <div className="text-sm text-gray-700 mb-1">💰 お預かり: ¥{receipt.deposit}</div>
              <div className="text-sm text-gray-700 mb-3">🔁 おつり: ¥{receipt.change}</div>

              <div className="text-sm text-gray-700 mb-1">🧾 レジ番号: {receipt.register_no}</div>
              <div className="text-sm text-gray-700">👨‍💼 担当者: {receipt.staff}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
