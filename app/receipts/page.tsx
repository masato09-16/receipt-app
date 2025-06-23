'use client';

import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
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
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">あなたのレシート一覧</h1>
      {receipts.length === 0 ? (
        <p>レシートが見つかりませんでした。</p>
      ) : (
        receipts.map((receipt) => (
          <div key={receipt.id} className="mb-6 p-4 border rounded bg-white shadow">
            <p className="font-bold">店舗名: {receipt.store_name}</p>
            <p>日付: {receipt.date}</p>
            <p>合計: {receipt.total} 円</p>
            <p className="mt-2 font-semibold">商品一覧:</p>
            <ul className="list-disc list-inside">
              {receipt.items.map((item: any, idx: number) => (
                <li key={idx}>{item.name} - {item.price}円</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
