'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '../../../../lib/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default function StoreProductsPage() {
  const [storeId, setStoreId] = useState<string | null>(null)

  // 商品登録
  const [products, setProducts] = useState<any[]>([])
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')

  // 支払方法、レジ番号、担当者
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [registers, setRegisters] = useState<any[]>([])
  const [staffs, setStaffs] = useState<any[]>([])

  const [newPaymentMethod, setNewPaymentMethod] = useState('')
  const [newRegister, setNewRegister] = useState('')
  const [newStaff, setNewStaff] = useState('')

  // ユーザー確認とデータ取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStoreId(user.uid)

        // 商品
        const productQuery = query(collection(db, 'stores', user.uid, 'products'))
        onSnapshot(productQuery, (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setProducts(items)
        })

        // 支払方法
        const payQuery = query(collection(db, 'stores', user.uid, 'paymentMethods'))
        onSnapshot(payQuery, (snapshot) => {
          setPaymentMethods(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        })

        // レジ番号
        const regQuery = query(collection(db, 'stores', user.uid, 'registers'))
        onSnapshot(regQuery, (snapshot) => {
          setRegisters(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        })

        // 担当者
        const staffQuery = query(collection(db, 'stores', user.uid, 'staffs'))
        onSnapshot(staffQuery, (snapshot) => {
          setStaffs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        })
      }
    })
    return () => unsubscribe()
  }, [])

  // 商品追加
  const handleAddProduct = async () => {
    if (!storeId || !productName || !productPrice) return
    await addDoc(collection(db, 'stores', storeId, 'products'), {
      name: productName,
      price: Number(productPrice),
      createdAt: new Date(),
    })
    setProductName('')
    setProductPrice('')
  }

  // 共通登録関数
  const handleAddCommonItem = async (collectionName: string, value: string, reset: () => void) => {
    if (!storeId || !value) return
    await addDoc(collection(db, 'stores', storeId, collectionName), { value })
    reset()
  }

  const handleDelete = async (collectionName: string, id: string) => {
    if (!storeId) return
    await deleteDoc(doc(db, 'stores', storeId, collectionName, id))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">商品設定（事前登録）</h1>

      {/* 商品フォーム */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="商品名"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            placeholder="価格（円）"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          商品を追加する
        </button>
        <ul className="space-y-2 mt-4">
          {products.map((p) => (
            <li key={p.id} className="border p-2 rounded flex justify-between items-center">
              {p.name} - ¥{p.price}
              <button
                onClick={() => handleDelete('products', p.id)}
                className="text-red-500 text-sm"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 支払方法 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">支払方法を登録</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="例: 現金 / クレジットカード"
            value={newPaymentMethod}
            onChange={(e) => setNewPaymentMethod(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={() =>
              handleAddCommonItem('paymentMethods', newPaymentMethod, () => setNewPaymentMethod(''))
            }
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            登録
          </button>
        </div>
        <ul className="space-y-1">
          {paymentMethods.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              {item.value}
              <button
                onClick={() => handleDelete('paymentMethods', item.id)}
                className="text-red-500 text-sm"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* レジ番号 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">レジ番号を登録</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="例: レジ1 / レジ2"
            value={newRegister}
            onChange={(e) => setNewRegister(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={() =>
              handleAddCommonItem('registers', newRegister, () => setNewRegister(''))
            }
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            登録
          </button>
        </div>
        <ul className="space-y-1">
          {registers.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              {item.value}
              <button
                onClick={() => handleDelete('registers', item.id)}
                className="text-red-500 text-sm"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 担当者 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">担当者を登録</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="担当者名"
            value={newStaff}
            onChange={(e) => setNewStaff(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={() => handleAddCommonItem('staffs', newStaff, () => setNewStaff(''))}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            登録
          </button>
        </div>
        <ul className="space-y-1">
          {staffs.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              {item.value}
              <button
                onClick={() => handleDelete('staffs', item.id)}
                className="text-red-500 text-sm"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
