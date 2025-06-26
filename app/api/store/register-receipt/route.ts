import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 明示的に各フィールドを展開して保存
    const {
      user_email,
      store_email, // ✅ 追加されていることが重要
      store_name,
      store_address,
      store_note,
      items,
      subtotal,
      tax,
      total,
      deposit,
      change,
      payment_method,
      register_no,
      staff,
      date,
    } = data;

    await addDoc(collection(db, 'receipts'), {
      user_email,
      store_email,      // ✅ クエリに必要なフィールド
      store_name,
      store_address,
      store_note,
      items,
      subtotal,
      tax,
      total,
      deposit,
      change,
      payment_method,
      register_no,
      staff,
      date,
    });

    return NextResponse.json({ message: 'Firestoreに保存完了' }, { status: 200 });
  } catch (err) {
    console.error('❌ Firestore保存エラー:', err);
    return NextResponse.json({ message: '保存に失敗しました' }, { status: 500 });
  }
}
