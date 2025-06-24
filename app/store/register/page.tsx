'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function StoreRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Firestore に店舗情報を保存
      await setDoc(doc(db, 'stores', uid), {
        email,
        storeName,
        createdAt: new Date(),
      });

      alert('店舗アカウントを登録しました');
      router.push('/store/login');
    } catch (error: any) {
      alert('登録に失敗しました: ' + error.message);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">店舗アカウント登録</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="店舗名"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2"
        />
        <button type="submit" className="bg-green-600 text-white py-2 rounded">
          登録する
        </button>
      </form>
    </main>
  );
}
