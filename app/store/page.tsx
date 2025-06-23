'use client';

import { useState } from 'react';

type Item = {
  name: string;
  price: string;
};

type Field = 'name' | 'price';

export default function StorePage() {
  const [userEmail, setUserEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [items, setItems] = useState<Item[]>([{ name: '', price: '' }]);

  const handleItemChange = (index: number, field: Field, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', price: '' }]);
  };

  const handleSubmit = async () => {
    const total = items.reduce((sum, item) => sum + Number(item.price), 0);
    const res = await fetch('/api/store/register-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: userEmail,
        store_name: storeName,
        date: new Date().toISOString().split('T')[0],
        items,
        total,
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
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">レシート登録（店舗用）</h1>

      <label className="block mb-2">ユーザーのメールアドレス</label>
      <input
        type="email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />

      <label className="block mb-2">店舗名</label>
      <input
        type="text"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />

      <h2 className="text-lg font-semibold mb-2">商品リスト</h2>
      {items.map((item, index) => (
        <div key={index} className="mb-2 flex gap-2">
          <input
            type="text"
            placeholder="商品名"
            value={item.name}
            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
            className="border p-2 w-1/2"
          />
          <input
            type="number"
            placeholder="価格"
            value={item.price}
            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
            className="border p-2 w-1/2"
          />
        </div>
      ))}

      <button
        onClick={handleAddItem}
        className="bg-gray-200 px-3 py-1 rounded mb-4"
      >
        ＋ 商品を追加
      </button>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        レシートを登録
      </button>
    </main>
  );
}
