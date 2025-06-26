'use client';

import { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';
import '../../globals.css';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/user/login');
      } else {
        setUserEmail(user.email ?? '');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/user/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">📄 レシートアプリ</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-300">ログイン中:</p>
            <p className="text-sm break-all">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
        >
          ログアウト
        </button>
      </aside>

      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  );
}
