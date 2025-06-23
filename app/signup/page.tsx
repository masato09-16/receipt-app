'use client';

import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/user'); // 登録後にレシート一覧へ遷移
    } catch (error) {
      alert('登録に失敗しました');
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">新規登録</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block font-medium">メールアドレス</label>
          <input
            type="email"
            className="w-full border px-2 py-1 rounded"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">パスワード（6文字以上）</label>
          <input
            type="password"
            className="w-full border px-2 py-1 rounded"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          登録
        </button>
      </form>
    </div>
  );
}
