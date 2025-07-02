// app/api/store/register-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Admin SDK の初期化（重複防止）
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return NextResponse.json({ message: 'Missing or invalid token' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const data = await req.json();

    const {
      user_email,
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

    await adminDb.collection('receipts').add({
      user_email,
      store_email: decoded.email, // ← 信頼できるログイン中の店舗メールをここでセット
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
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Firestoreに保存完了' }, { status: 200 });
  } catch (err) {
    console.error('❌ 認証またはFirestore保存エラー:', err);
    return NextResponse.json({ message: '保存に失敗しました' }, { status: 500 });
  }
}
