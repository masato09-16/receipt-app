'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function StoreReceiptPage() {
  const [userEmail, setUserEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }]);
  const [total, setTotal] = useState(0);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<{ name: string; price: number }[]>([]);

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
    const items = snapshot.docs.map((doc) => doc.data() as { name: string; price: number });
    setProducts(items);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleProductSelect = (index: number, value: string) => {
    const selected = products.find((p) => p.name === value);
    if (selected) {
      const newItems = [...items];
      newItems[index] = { name: selected.name, price: selected.price.toString() };
      setItems(newItems);
    }
  };

  const calculateTotal = () => {
    const sum = items.reduce((acc, item) => acc + Number(item.price || 0), 0);
    setTotal(sum);
  };

  useEffect(() => {
    calculateTotal();
  }, [items]);

  const handleAddItem = () => {
    setItems([...items, { name: '', price: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch('/api/store/register-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: userEmail,
        store_name: storeName,
        items: items.map((item) => ({ ...item, price: Number(item.price) })),
        total,
        date: today,
      }),
    });
    if (res.ok) {
      alert('レシート登録に成功しました');
      setUserEmail('');
      setStoreName('');
      setItems([{ name: '', price: '' }]);
    } else {
      alert('登録に失敗しました');
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      {/* 🔗 ナビゲーションリンク */}
      <div className="mb-6 flex gap-4">
        <Link href="/store/register" className="text-blue-600 hover:underline">
          店舗登録へ
        </Link>
        <Link href="/store/products" className="text-blue-600 hover:underline">
          商品管理へ →
        </Link>
      </div>

      <h1 className="text-xl font-bold mb-4">レシート登録</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="ユーザーのメールアドレス"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="text"
          placeholder="店舗名"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="border p-2"
        />

        <h2 className="font-semibold">商品一覧</h2>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              value={item.name}
              onChange={(e) => handleProductSelect(index, e.target.value)}
              className="border p-2 w-1/2"
            >
              <option value="">商品を選択</option>
              {products.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name}（¥{p.price}）
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="価格"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              className="border p-2 w-1/2"
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddItem} className="bg-gray-300 py-1 px-2 rounded w-fit">
          + 商品追加
        </button>

        <div className="font-semibold mt-4">合計: ¥{total}</div>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          レシート登録
        </button>
      </form>
    </main>
  );
}
