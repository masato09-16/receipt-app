'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';



export default function ProductRegisterPage() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStoreId(user.uid);
        fetchProducts(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async (uid: string) => {
    const q = query(collection(db, 'products'), where('storeId', '==', uid));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(items);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return alert('ログインが必要です');
    try {
      await addDoc(collection(db, 'products'), {
        name: productName,
        price: Number(price),
        storeId,
        createdAt: new Date(),
      });
      alert('商品を登録しました');
      setProductName('');
      setPrice('');
      fetchProducts(storeId); // 再読み込み
    } catch (error: any) {
      alert('登録に失敗しました: ' + error.message);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">商品登録フォーム</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="商品名"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="number"
          placeholder="価格"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border p-2"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          登録する
        </button>
      </form>

      <h2 className="text-lg font-semibold mt-6">登録済み商品一覧</h2>
      <ul className="mt-2">
        {products.map((p) => (
          <li key={p.id} className="border-b py-1">
            {p.name}：¥{p.price}
          </li>
        ))}
      </ul>
    </main>
  );
}
