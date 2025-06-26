'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ReceiptListPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchReceipts = async () => {
      const q = query(collection(db, 'receipts'), where('user_email', '==', userEmail));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceipts(data);
    };

    fetchReceipts();
  }, [userEmail]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🧾 あなたの電子レシート</h1>

      {receipts.length === 0 ? (
        <p className="text-center text-gray-500">レシートが見つかりませんでした。</p>
      ) : (
        receipts.map((receipt) => (
          <div key={receipt.id} className="mb-8 p-6 bg-white rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-center mb-2">電子レシート</h2>
            <p><span className="font-semibold">📍 店舗名:</span> {receipt.store_name}</p>
            <p><span className="font-semibold">📅 日付:</span> {receipt.date}</p>
            <p><span className="font-semibold">👤 ユーザー:</span> {receipt.user_email}</p>

            <hr className="my-2" />

            <div className="text-sm">
              <div className="flex justify-between font-semibold border-b py-1">
                <span>商品名</span>
                <span>価格</span>
              </div>
              {receipt.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between py-1">
                  <span>{item.name}</span>
                  <span>¥{item.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t mt-2 pt-2">
                <span>合計</span>
                <span>¥{receipt.total}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
