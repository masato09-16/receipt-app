'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, auth } from '../../../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function StoreReceiptPage() {
  const [userEmail, setUserEmail] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeNote, setStoreNote] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [deposit, setDeposit] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [staff, setStaff] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<{ name: string; price: number }[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<string[]>([]);
  const [registerOptions, setRegisterOptions] = useState<string[]>([]);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/store/login');
        return;
      }
      setStoreId(user.uid);
      setStoreEmail(user.email ?? '');
      fetchProducts(user.uid);

      const q = query(collection(db, 'stores'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setStoreName(data.store_name || '');
        setStoreAddress(data.address || '');
        setStoreNote(data.note || '');
      }

      const fetchOptions = async (colName: string): Promise<string[]> => {
        const snapshot = await getDocs(collection(db, 'stores', user.uid, colName));
        return snapshot.docs.map((doc) => doc.data().value);
      };

      setPaymentOptions(await fetchOptions('paymentMethods'));
      setRegisterOptions(await fetchOptions('registers'));
      setStaffOptions(await fetchOptions('staffs'));
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProducts = async (uid: string) => {
    const snapshot = await getDocs(collection(db, 'stores', uid, 'products'));
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
    const taxAmount = Math.round(sum * 0.1);
    setSubtotal(sum);
    setTax(taxAmount);
    setTotal(sum + taxAmount);
    if (deposit !== null) setChange(deposit - (sum + taxAmount));
  };

  useEffect(() => {
    calculateTotal();
  }, [items, deposit]);

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
        store_email: storeEmail,
        store_name: storeName,
        store_address: storeAddress,
        store_note: storeNote,
        items: items.map((item) => ({ ...item, price: Number(item.price) })),
        subtotal,
        tax,
        total,
        deposit,
        change,
        payment_method: paymentMethod,
        register_no: registerNo,
        staff,
        date: today,
      }),
    });
    if (res.ok) {
      alert('レシート登録に成功しました');
      setUserEmail('');
      setItems([{ name: '', price: '' }]);
      setDeposit(null);
      setChange(null);
    } else {
      alert('登録に失敗しました');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">🧾 レシート登録</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-600">店舗名：{storeName}</p>
        <p className="text-sm text-gray-600">住所：{storeAddress}</p>
        <p className="text-sm text-gray-600">日付：{new Date().toLocaleDateString()}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-600 mb-1">ユーザーのメールアドレス</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">商品一覧</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select
                value={item.name}
                onChange={(e) => handleProductSelect(index, e.target.value)}
                className="w-1/2 border border-gray-300 rounded p-2"
              >
                <option value="">商品を選択</option>
                {products.map((product, idx) => (
                  <option key={idx} value={product.name}>
                    {product.name}（¥{product.price}）
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                className="w-1/2 border border-gray-300 rounded p-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="text-blue-500 text-sm hover:underline"
          >
            + 商品を追加
          </button>
        </div>

        <div className="text-right text-gray-700">
          <p>小計: ¥{subtotal}</p>
          <p>消費税: ¥{tax}</p>
          <p className="text-lg font-bold">合計: ¥{total}</p>
        </div>

        <div>
          <label className="block text-gray-600 mb-1">支払方法</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">選択してください</option>
            {paymentOptions.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 mb-1">お預かり</label>
          <input
            type="number"
            value={deposit ?? ''}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">おつり</label>
          <input
            type="number"
            value={change ?? ''}
            readOnly
            className="w-full border border-gray-200 rounded-lg p-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">レジ番号</label>
          <select
            value={registerNo}
            onChange={(e) => setRegisterNo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">選択してください</option>
            {registerOptions.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 mb-1">担当者</label>
          <select
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">選択してください</option>
            {staffOptions.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          レシートを登録
        </button>
      </form>
    </main>
  );
}
