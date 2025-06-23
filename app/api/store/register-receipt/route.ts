import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await addDoc(collection(db, 'receipts'), data);

    return NextResponse.json({ message: 'Firestoreに保存完了' }, { status: 200 });
  } catch (err) {
    console.error('❌ Firestore保存エラー:', err);
    return NextResponse.json({ message: '保存に失敗しました' }, { status: 500 });
  }
}
