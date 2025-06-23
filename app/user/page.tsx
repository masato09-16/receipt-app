'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

export default function UserDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert('ログインに失敗しました');
      console.error(err);
    }
  };

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

  const handleLogout = async () => {
    await signOut(auth);
    setUserEmail(null);
    setReceipts([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {!userEmail ? (
        <>
          <h1 className="text-xl font-bold mb-4">あなたのページ</h1>
          <p className="mb-4">まだログインしていません。</p>
          <div className="space-x-4">
            <Link href="/login" className="text-blue-600 underline">
              ＠＠ログインはこちら
            </Link>
            <Link href="/signup" className="text-green-600 underline">
              ＠＠新規登録はこちら
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">あなたのレシート一覧</h1>
            <button onClick={handleLogout} className="text-sm text-red-500 underline">
              ログアウト
            </button>
          </div>
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
        </>
      )}
    </div>
  );
}
