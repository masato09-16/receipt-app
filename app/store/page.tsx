'use client';

import { useState } from "react";

export default function StoreReceiptForm() {
  const [userEmail, setUserEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [items, setItems] = useState([{ name: "", price: "" }]);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", price: "" }]);
  };

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const receiptData = {
      user_email: userEmail,
      date: new Date().toISOString().slice(0, 10),
      store_name: storeName,
      items: items.map((item) => ({ name: item.name, price: Number(item.price) })),
      total,
    };

    const res = await fetch("/api/store/register-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receiptData),
    });

    if (res.ok) {
      alert("レシート登録に成功しました");
      setUserEmail("");
      setStoreName("");
      setItems([{ name: "", price: "" }]);
    } else {
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">店舗用レシート登録フォーム</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">ユーザーのメールアドレス</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">店舗名</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">商品一覧</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="商品名"
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
                required
              />
              <input
                type="number"
                placeholder="価格"
                value={item.price}
                onChange={(e) => handleItemChange(index, "price", e.target.value)}
                className="w-24 border px-2 py-1 rounded"
                required
              />
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-blue-500">+ 商品を追加</button>
        </div>
        <div>
          <p className="font-medium">合計金額: {total} 円</p>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">レシート登録</button>
      </form>
    </div>
  );
}
